import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

type PersonalInfo = {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  disabilityType?: string | null;
  mobilityLevel?: string | null;
  wheelchairUser?: boolean | null;
  fatigueTrigger?: string | null;
  medicationRoutine?: string | null;
  workStudySchedule?: string | null;
  accessibilityNeeds?: string | null;
};

type PersonalInfoResponse = {
  data: PersonalInfo | null;
};

const emptyProfile: PersonalInfo = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  disabilityType: "",
  mobilityLevel: "",
  wheelchairUser: false,
  fatigueTrigger: "",
  medicationRoutine: "",
  workStudySchedule: "",
  accessibilityNeeds: "",
};

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PersonalInfo>(emptyProfile);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<PersonalInfoResponse>("/member/profile")
      .then(({ data }) => {
        if (data) {
          setProfile({
            ...emptyProfile,
            ...data,
            dateOfBirth: data.dateOfBirth ?? "",
            wheelchairUser: data.wheelchairUser ?? false,
          });
          setHasProfile(true);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load profile");
      })
      .finally(() => setIsLoading(false));
  }, []);

  function updateField<K extends keyof PersonalInfo>(
    field: K,
    value: PersonalInfo[K],
  ) {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const method = hasProfile ? "PUT" : "POST";

      const payload = {
        ...profile,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender || null,
        phoneNumber: profile.phoneNumber || null,
        emergencyContactName: profile.emergencyContactName || null,
        emergencyContactPhone: profile.emergencyContactPhone || null,
        address: profile.address || null,
        city: profile.city || null,
        state: profile.state || null,
        postalCode: profile.postalCode || null,
        country: profile.country || null,
        disabilityType: profile.disabilityType || null,
        mobilityLevel: profile.mobilityLevel || null,
        fatigueTrigger: profile.fatigueTrigger || null,
        medicationRoutine: profile.medicationRoutine || null,
        workStudySchedule: profile.workStudySchedule || null,
        accessibilityNeeds: profile.accessibilityNeeds || null,
      };
      
      const result = await api<PersonalInfoResponse>("/member/profile", {
        method,
        body: JSON.stringify(payload),
      });

      if (result.data) {
        setProfile({
          ...emptyProfile,
          ...result.data,
          dateOfBirth: result.data.dateOfBirth ?? "",
          wheelchairUser: result.data.wheelchairUser ?? false,
        });
      }

      setHasProfile(true);
      setMessage("Profile saved successfully.");
      navigate("/dashboard/member");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <h1>Profile</h1>
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <h1>Member profile</h1>
      <p>Add your personal details so Lifely AI can support your care plan.</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <section>
          <h2>Basic information</h2>

          <label>
            First name
            <input
              value={profile.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              required
            />
          </label>

          <label>
            Last name
            <input
              value={profile.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              required
            />
          </label>

          <label>
            Date of birth
            <input
              type="date"
              value={profile.dateOfBirth ?? ""}
              onChange={(event) =>
                updateField("dateOfBirth", event.target.value)
              }
            />
          </label>

          <label>
            Gender
            <input
              value={profile.gender ?? ""}
              onChange={(event) => updateField("gender", event.target.value)}
            />
          </label>

          <label>
            Phone number
            <input
              value={profile.phoneNumber ?? ""}
              onChange={(event) =>
                updateField("phoneNumber", event.target.value)
              }
            />
          </label>
        </section>

        <section>
          <h2>Emergency contact</h2>

          <label>
            Contact name
            <input
              value={profile.emergencyContactName ?? ""}
              onChange={(event) =>
                updateField("emergencyContactName", event.target.value)
              }
            />
          </label>

          <label>
            Contact phone
            <input
              value={profile.emergencyContactPhone ?? ""}
              onChange={(event) =>
                updateField("emergencyContactPhone", event.target.value)
              }
            />
          </label>
        </section>

        <section>
          <h2>Address</h2>

          <label>
            Address
            <textarea
              value={profile.address ?? ""}
              onChange={(event) => updateField("address", event.target.value)}
            />
          </label>

          <label>
            City
            <input
              value={profile.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </label>

          <label>
            State
            <input
              value={profile.state ?? ""}
              onChange={(event) => updateField("state", event.target.value)}
            />
          </label>

          <label>
            Postal code
            <input
              value={profile.postalCode ?? ""}
              onChange={(event) =>
                updateField("postalCode", event.target.value)
              }
            />
          </label>

          <label>
            Country
            <input
              value={profile.country ?? ""}
              onChange={(event) => updateField("country", event.target.value)}
            />
          </label>
        </section>

        <section>
          <h2>Care needs</h2>

          <label>
            Disability type
            <input
              value={profile.disabilityType ?? ""}
              onChange={(event) =>
                updateField("disabilityType", event.target.value)
              }
            />
          </label>

          <label>
            Mobility level
            <input
              value={profile.mobilityLevel ?? ""}
              onChange={(event) =>
                updateField("mobilityLevel", event.target.value)
              }
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={Boolean(profile.wheelchairUser)}
              onChange={(event) =>
                updateField("wheelchairUser", event.target.checked)
              }
            />
            Wheelchair user
          </label>

          <label>
            Fatigue trigger
            <input
              value={profile.fatigueTrigger ?? ""}
              onChange={(event) =>
                updateField("fatigueTrigger", event.target.value)
              }
            />
          </label>

          <label>
            Medication routine
            <input
              value={profile.medicationRoutine ?? ""}
              onChange={(event) =>
                updateField("medicationRoutine", event.target.value)
              }
            />
          </label>

          <label>
            Work or study schedule
            <input
              value={profile.workStudySchedule ?? ""}
              onChange={(event) =>
                updateField("workStudySchedule", event.target.value)
              }
            />
          </label>

          <label>
            Accessibility needs
            <textarea
              value={profile.accessibilityNeeds ?? ""}
              onChange={(event) =>
                updateField("accessibilityNeeds", event.target.value)
              }
            />
          </label>
        </section>

        {error ? <p className="auth-error">{error}</p> : null}
        {message ? <p className="profile-success">{message}</p> : null}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
}
