import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata = {
  title: "EstadoHUB — APIs Públicas Chile",
  description: "Dashboard centralizado para TGR Remates y Mercado Público",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}