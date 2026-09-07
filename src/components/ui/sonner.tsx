import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton={true}
      richColors={true}
      duration={8000}
      swipeDirections={["top", "right", "left", "bottom"]}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0F172A]/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-white/15 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-[18px] group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[12px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:rounded-[10px] group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:font-bold text-[12px] shadow-sm active:scale-95 transition-all",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-foreground group-[.toast]:rounded-[10px] group-[.toast]:px-3 group-[.toast]:py-1.5 text-[12px] active:scale-95 transition-all",
          closeButton:
            "group-[.toast]:bg-white/15 group-[.toast]:text-white group-[.toast]:border-white/20 hover:group-[.toast]:bg-white/25 active:scale-90 transition-all",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
