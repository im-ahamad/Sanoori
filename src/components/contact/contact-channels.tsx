import {
  Camera,
  MessageCircle,
  MessagesSquare,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";
import type { ContactChannel } from "@/lib/contact-channels";
import type { ContactChannelId } from "@/lib/contact-channels";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: Record<ContactChannelId, LucideIcon> = {
  whatsapp: MessageCircle,
  facebook: MessagesSquare,
  instagram: Camera,
  telegram: Send,
  phone: Phone,
};

const CHANNEL_ACTIONS: Record<ContactChannelId, string> = {
  whatsapp: "Chat on WhatsApp",
  facebook: "Message us",
  instagram: "Message us",
  telegram: "Message us",
  phone: "Call now",
};

/**
 * Renders the configured business contact channels as cards. Channels still
 * left as "[PLACEHOLDER]" are excluded by the caller, so nothing fake is ever
 * shown to customers.
 */
export function ContactChannels({ channels }: { channels: ContactChannel[] }) {
  const primary = channels.find((channel) => channel.id === "whatsapp");
  const secondary = channels.filter((channel) => channel.id !== "whatsapp");

  return (
    <div className="space-y-4">
      {primary && (
        <a
          href={primary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-lg bg-[#25D366] p-5 text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-white/20">
            <MessageCircle className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-xs font-medium uppercase tracking-wider text-white/85">
              {primary.label}
            </span>
            <span className="mt-0.5 block font-heading text-base font-semibold text-white">
              The fastest way to reach us
            </span>
            <span className="mt-0.5 block text-sm text-white/85">
              {CHANNEL_ACTIONS.whatsapp} — no account needed
            </span>
          </span>
          <svg
            aria-hidden="true"
            className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      )}

      {secondary.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {secondary.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.id];
            return (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  {...(channel.id === "phone"
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="group flex items-center gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {channel.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-sm font-semibold text-foreground transition-colors group-hover:text-primary",
                        channel.id === "phone" && "text-base"
                      )}
                    >
                      {CHANNEL_ACTIONS[channel.id]}
                    </span>
                  </span>
                  <svg
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}