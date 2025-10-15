declare module "react-modal-image" {
  import React from "react";

  interface ModalImageProps {
    small: string;
    large: string;
    alt?: string;
    className?: string;
    hideDownload?: boolean;
    hideZoom?: boolean;
    showRotate?: boolean;
    imageBackgroundColor?: string;
    onClose?: () => void;
  }

  const ModalImage: React.FC<ModalImageProps>;
  export default ModalImage;
}
