function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

export async function initImages() {
  await Promise.all([
    loadImage('/assets/images/densityMaps/shore-density.png'),
    loadImage('/assets/images/densityMaps/shore-rocks-density.png'),
    loadImage('/assets/images/densityMaps/plants-density.png'),
    loadImage('/assets/images/enviroment/pond.png'),
    loadImage('/assets/images/sidebar/sidebar-bk.png'),
    loadImage('/assets/images/sidebar/money-icon.png'),
    loadImage('/assets/images/sidebar/shop-button.png')
  ])
}