import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";

interface AssistantWidgetProps {
  hideFloatingTrigger?: boolean;
  redirectToDashboard?: boolean;
}

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  hideFloatingTrigger = true,
  redirectToDashboard = true,
}) => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  // Dengarkan event eksternal "open-assistant" (misal dari tombol "Tanya Juru Mudi AI" di peta atau Navbar)
  // Seluruh interaksi dialihkan langsung ke dashboard layar penuh: /dashboard?tab=ai-chat
  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      if (customEvent.detail?.prompt) {
        try {
          sessionStorage.setItem("pending_assistant_prompt", customEvent.detail.prompt);
        } catch (err) {
          console.warn("Gagal menyimpan pending prompt:", err);
        }
      }
      navigate("/dashboard?tab=ai-chat");
    };

    window.addEventListener("open-assistant", onOpenEvent);
    return () => {
      window.removeEventListener("open-assistant", onOpenEvent);
    };
  }, [navigate]);

  const handleOpenClick = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setAuthOpen(true);
      return;
    }
    navigate("/dashboard?tab=ai-chat");
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    navigate("/dashboard?tab=ai-chat");
  };

  // Popup chatbot dihilangkan secara menyeluruh — seluruh chatbot berada di /dashboard?tab=ai-chat
  if (hideFloatingTrigger) {
    return null;
  }

  return (
    <>
      <Button
        variant="hero"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl z-50 p-0 flex items-center justify-center bg-[#0B1528] hover:bg-[#1E293B] transition-transform hover:scale-105 active:scale-95"
        onClick={handleOpenClick}
        aria-label="Buka Chat Juru Mudi AI"
      >
        <Bot className="h-7 w-7 text-white" aria-hidden="true" />
      </Button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default AssistantWidget;
