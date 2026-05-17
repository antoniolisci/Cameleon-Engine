// Applique la classe onboarding-seen sur <html> avant le rendu du body,
// pour éviter un flash de l'overlay onboarding au chargement.
// Chargé en script synchrone dans <head> — intentionnel (pas de defer/module).
try {
  if (localStorage.getItem('CE_onboarding_v1')) {
    document.documentElement.classList.add('onboarding-seen');
  }
} catch (e) {}
