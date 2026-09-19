import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWhatsAppChatLink } from "@/lib/contact/whatsapp";

interface InquiryContactActionsProps {
  /** Normalised customer phone number (always present on a website inquiry). */
  phone: string;
  /** Customer email when provided on the form. */
  email: string | null;
  /** Pre-filled WhatsApp message; when null the WhatsApp action is hidden. */
  whatsappMessage: string | null;
  /** Renders compact icon-only buttons (used in list rows). */
  compact?: boolean;
}

/**
 * Quick contact actions for an inquiry. Only actions backed by real data are
 * rendered — there are no placeholder tel:/mailto:/wa.me links.
 */
export function InquiryContactActions({
  phone,
  email,
  whatsappMessage,
  compact = false,
}: InquiryContactActionsProps) {
  const telHref = `tel:${phone}`;
  const mailHref = email ? `mailto:${email}` : null;
  const whatsappHref = whatsappMessage
    ? buildWhatsAppChatLink(phone, whatsappMessage)
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<a href={telHref} />}
          aria-label={`Call ${phone}`}
          title={`Call ${phone}`}
        >
          <Phone className="size-4" />
        </Button>
        {mailHref ? (
          <Button
            variant="ghost"
            size="icon-sm"
            render={<a href={mailHref} />}
            aria-label={`Email ${email}`}
            title={`Email ${email}`}
          >
            <Mail className="size-4" />
          </Button>
        ) : null}
        {whatsappHref ? (
          <Button
            variant="ghost"
            size="icon-sm"
            render={
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            aria-label={`WhatsApp ${phone}`}
            title={`WhatsApp ${phone}`}
          >
            <MessageCircle className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        render={<a href={telHref} />}
        className="flex-1"
      >
        <Phone className="size-4" aria-hidden="true" />
        Call
      </Button>
      {mailHref ? (
        <Button
          variant="outline"
          size="sm"
          render={<a href={mailHref} />}
          className="flex-1"
        >
          <Mail className="size-4" aria-hidden="true" />
          Email
        </Button>
      ) : null}
      {whatsappHref ? (
        <Button
          variant="outline"
          size="sm"
          render={
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" />
          }
          className={cn("flex-1", email ? "" : "basis-full")}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp
        </Button>
      ) : null}
    </div>
  );
}