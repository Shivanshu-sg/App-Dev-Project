import { appDataSource } from '../../../database/data-source.js';
import { CaregiverNote } from '../../caregiver/notes/caregiver-notes.entity.js';
import { PersonalInfo } from '../personal-info/personal-info.entity.js';
import { User } from '../../identity/user.entity.js';

export const getMemberCaregiverNotes = async (memberId: string) => {
  const notes = await appDataSource.getRepository(CaregiverNote).find({
    where: {
      memberId,
    },
    relations: {
      caregiver: true,
    },
    order: {
      isImportant: 'DESC',
      createdAt: 'DESC',
    },
  });

  return Promise.all(
    notes.map(async (note) => {
      const caregiverProfile = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: note.caregiverId } });

      const fallbackCaregiver = await appDataSource
        .getRepository(User)
        .findOne({ where: { id: note.caregiverId } });

      const caregiverName =
        `${caregiverProfile?.firstName ?? ''} ${caregiverProfile?.lastName ?? ''}`.trim() ||
        note.caregiver?.name ||
        fallbackCaregiver?.name ||
        'Caregiver';

      return {
        id: note.id,
        caregiverId: note.caregiverId,
        caregiverName,
        note: note.note,
        category: note.category,
        isImportant: note.isImportant,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
    }),
  );
};