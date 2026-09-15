document.addEventListener("DOMContentLoaded", () => {
  const popupOverlay = document.getElementById("termsPopupOverlay");
  const closePopupBtn = document.getElementById("acceptTermsBtn");

  if (!popupOverlay || !closePopupBtn) {
    return;
  }

  const hasSeenPopup = localStorage.getItem("hasSeenPopup");

  if (!hasSeenPopup) {
    popupOverlay.style.display = "flex";
  } else {
    popupOverlay.style.display = "none";
  }

  closePopupBtn.addEventListener("click", () => {
    popupOverlay.style.display = "none";
    localStorage.setItem("hasSeenPopup", "true");
  });
});