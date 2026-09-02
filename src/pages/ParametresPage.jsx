import { useState } from "react";
import { Camera, X } from "lucide-react";

import Avatar from "../components/ui/Avatar";
import { showToast } from "../utils/toast";

function ParametresPage({ currentUser, onUpdateProfile }) {
  const [firstName, setFirstName] = useState(
    currentUser?.firstName ?? ""
  );

  const [lastName, setLastName] = useState(
    currentUser?.lastName ?? ""
  );

  const [photoPreview, setPhotoPreview] = useState(
    currentUser?.avatarUrl ?? null
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhotoPreview(null);
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setSaved(false);

    try {
      await onUpdateProfile({
        firstName,
        lastName,
        avatarUrl: photoPreview,
      });

      setSaved(true);

      showToast({
        type: "success",
        message: "Profil mis à jour",
      });

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du profil :",
        error
      );

      showToast({
        type: "error",
        message: "Impossible de mettre à jour le profil",
      });
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = currentUser?.globalRoles?.includes("ADMIN")
    ? "Administrateur"
    : currentUser?.departmentRoles
        ?.map(
          (dr) =>
            `${dr.role === "SCRUM_MASTER" ? "Scrum Master" : "Membre"} · ${dr.departmentName}`
        )
        .join(", ") || "—";

  return (
    <div className="px-8 py-6 max-w-[640px] space-y-6">
      <div>
        <h1 className="text-[20px] font-semibold text-slate-900">
          Paramètres
        </h1>

        <p className="text-[13px] text-slate-400 mt-0.5">
          Gérez vos informations personnelles et votre photo de profil.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Photo */}
        <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-5">
          <h2 className="text-[13.5px] font-semibold text-slate-800 mb-4">
            Photo de profil
          </h2>

          <div className="flex items-center gap-5">
            <Avatar
              userId={currentUser?.id}
              firstName={firstName}
              lastName={lastName}
              photoUrl={photoPreview}
              size="xl"
            />

            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium px-3.5 py-2 cursor-pointer transition-colors w-fit">
                <Camera size={14} />

                {photoPreview
                  ? "Changer la photo"
                  : "Ajouter une photo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-red-600 w-fit"
                >
                  <X size={12} />

                  Utiliser la couleur par défaut
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-5">
          <h2 className="text-[13.5px] font-semibold text-slate-800 mb-4">
            Informations personnelles
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
                Prénom
              </label>

              <input
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
                Nom
              </label>

              <input
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white text-[13.5px] px-3.5 py-2.5 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
              Email
            </label>

            <input
              value={currentUser?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-100 text-[13.5px] text-slate-500 px-3.5 py-2.5 outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
              Rôle
            </label>

            <p className="text-[13.5px] text-slate-700">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Enregistrement */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-medium px-5 py-2.5 transition-colors disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer"}
          </button>

          {saved && (
            <span className="text-[13px] text-green-600 font-medium">
              Enregistré ✓
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

export default ParametresPage;