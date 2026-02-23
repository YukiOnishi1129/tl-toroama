"use client";

import { useState } from "react";
import { ImageGalleryModal } from "./image-gallery-modal";

interface SampleImageGalleryProps {
  images: string[];
  title: string;
}

export function SampleImageGallery({ images, title }: SampleImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="flex flex-col gap-3">
        {images.map((imageUrl, index) => (
          <button
            type="button"
            key={imageUrl}
            onClick={() => handleImageClick(index)}
            className="block overflow-hidden rounded-xl border border-border hover:border-primary transition-colors cursor-pointer"
          >
            <img
              src={imageUrl || "https://placehold.co/600x400/fff8f6/8b7d72?text=No+Image"}
              alt={`${title} サンプル ${index + 1}`}
              className="w-full h-auto object-contain hover:scale-[1.02] transition-transform"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/fff8f6/8b7d72?text=No+Image"; }}
            />
          </button>
        ))}
      </div>

      <ImageGalleryModal
        images={images}
        initialIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      />
    </>
  );
}
