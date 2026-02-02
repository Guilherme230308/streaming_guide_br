import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_COMPLETED_KEY = "onboarding_tour_completed";

export function useOnboardingTour() {
  useEffect(() => {
    // Check if tour was already completed
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    
    if (tourCompleted === "true") {
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startTour();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: "body",
          popover: {
            title: "Bem-vindo ao Onde Assistir! 🎬",
            description: "Vamos fazer um tour rápido pelas principais funcionalidades do site. Você pode pular a qualquer momento clicando em 'Pular'.",
            align: "center",
          },
        },
        {
          element: "[data-tour='search']",
          popover: {
            title: "Busca Inteligente 🔍",
            description: "Digite o nome de qualquer filme ou série para descobrir onde assistir no Brasil. O autocomplete sugere resultados enquanto você digita!",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: "[data-tour='subscriptions']",
          popover: {
            title: "Minhas Assinaturas 📺",
            description: "Configure quais streamings você assina (Netflix, Prime Video, etc). Assim podemos filtrar e mostrar apenas conteúdo disponível para você!",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='lists']",
          popover: {
            title: "Listas Personalizadas 📋",
            description: "Crie listas customizadas para organizar filmes e séries. Perfeito para 'Assistir Depois', 'Favoritos', 'Filmes de Terror', etc.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='alerts']",
          popover: {
            title: "Alertas Inteligentes 🔔",
            description: "Ative alertas para receber notificações quando um filme ou série chegar nos streamings que você assina!",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='history']",
          popover: {
            title: "Histórico & Recomendações 🎯",
            description: "Marque filmes e séries como 'Assistido' para receber recomendações personalizadas baseadas no seu gosto!",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "[data-tour='genres']",
          popover: {
            title: "Explorar por Gêneros 🎭",
            description: "Navegue por categorias como Ação, Comédia, Terror e descubra novos conteúdos para assistir.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "body",
          popover: {
            title: "Pronto para começar! 🚀",
            description: "Agora você conhece todas as funcionalidades principais. Aproveite o Onde Assistir e nunca mais perca tempo procurando onde assistir seus filmes e séries favoritos!",
            align: "center",
          },
        },
      ],
      onDestroyStarted: () => {
        // Mark tour as completed when user finishes or skips
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  const restartTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    startTour();
  };

  return { restartTour };
}

export function resetOnboardingTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}
