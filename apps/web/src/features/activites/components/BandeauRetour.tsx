import { Icone } from "../../../components/ui/Icone";
import { useActivites } from "../contexte";

/** Bandeau de confirmation affiché après une inscription ou une annulation. */
export function BandeauRetour() {
  const { message, fermerMessage } = useActivites();
  if (message === null) return null;

  const styleType =
    message.type === "succes"
      ? "border-gresi-vert bg-gresi-vert/20"
      : "border-gresi-bleu bg-gresi-bleu/10";

  return (
    <div
      role="status"
      className={`mb-6 flex items-center justify-between gap-3 rounded-lg border p-4 ${styleType}`}
    >
      <p className="flex items-center gap-3 font-semibold">
        <Icone
          nom={message.type === "succes" ? "check_circle" : "info"}
          rempli
          className="text-[22px] text-gresi-bleu"
        />
        <span>{message.texte}</span>
      </p>
      <button
        type="button"
        onClick={fermerMessage}
        aria-label="Fermer le message"
        className="rounded p-1 hover:bg-black/5"
      >
        <Icone nom="close" className="text-[20px]" />
      </button>
    </div>
  );
}
