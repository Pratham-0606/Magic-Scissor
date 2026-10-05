/**
 * Magic Scissors - 3D Sidebar Depth Controller
 * Upgrades drawer navigation with frosted glass depth, layered floating shadow,
 * and physical hover elevation while preserving all links and actions.
 */

export class ThreeDimensionalSidebar {
  constructor() {
    this.init();
  }

  init() {
    const drawer = document.getElementById('navDrawer');
    if (!drawer) return;

    drawer.classList.add('nav-drawer-3d');

    const navLinks = drawer.querySelectorAll('.drawer-nav-link, .drawer-btn, .drawer-instagram-card');
    navLinks.forEach(item => {
      item.classList.add('drawer-3d-item');
    });
  }
}
