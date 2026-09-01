import { appDataSource } from '../../../database/data-source.js';
import { AppError } from '../../../lib/errors.js';
import { CaregiverAssignment } from '../../member/care-plans/care-giver-assignment.entity.js';
import {
  CaregiverNote,
  CaregiverNoteCategory,
} from './caregiver-notes.entity.js';

type CaregiverNoteInput = {
  note: string;
  category?: CaregiverNoteCategory;
  isImportant?: boolean;
};

const ensureAssignedMember = async (caregiverId: string, memberId: string) => {
  const assignment = await appDataSource
    .getRepository(CaregiverAssignment)
    .findOne({
      where: {
        caregiverId,
        userId: memberId,
      },
    });

  if (!assignment) throw new AppError(404, 'Member not found');
};

export const getCaregiverNotes = async (
  caregiverId: string,
  memberId: string,
) => {
  await ensureAssignedMember(caregiverId, memberId);

  return appDataSource.getRepository(CaregiverNote).find({
    where: {
      caregiverId,
      memberId,
    },
    order: {
      isImportant: 'DESC',
      createdAt: 'DESC',
    },
  });
};

export const createCaregiverNote = async (
  caregiverId: string,
  memberId: string,
  input: CaregiverNoteInput,
) => {
  await ensureAssignedMember(caregiverId, memberId);

  const noteRepo = appDataSource.getRepository(CaregiverNote);

  const caregiverNote = noteRepo.create({
    caregiverId,
    memberId,
    note: input.note,
    category: input.category ?? 'general',
    isImportant: input.isImportant ?? false,
  });

  return noteRepo.save(caregiverNote);
};

export const updateCaregiverNote = async (
  caregiverId: string,
  memberId: string,
  noteId: string,
  input: Partial<CaregiverNoteInput>,
) => {
  await ensureAssignedMember(caregiverId, memberId);

  const noteRepo = appDataSource.getRepository(CaregiverNote);

  const caregiverNote = await noteRepo.findOne({
    where: {
      id: noteId,
      caregiverId,
      memberId,
    },
  });

  if (!caregiverNote) throw new AppError(404, 'Note not found');

  noteRepo.merge(caregiverNote, input);

  return noteRepo.save(caregiverNote);
};

export const deleteCaregiverNote = async (
  caregiverId: string,
  memberId: string,
  noteId: string,
) => {
  await ensureAssignedMember(caregiverId, memberId);

  const noteRepo = appDataSource.getRepository(CaregiverNote);

  const caregiverNote = await noteRepo.findOne({
    where: {
      id: noteId,
      caregiverId,
      memberId,
    },
  });

  if (!caregiverNote) throw new AppError(404, 'Note not found');

  await noteRepo.remove(caregiverNote);

  return { deleted: true };
};