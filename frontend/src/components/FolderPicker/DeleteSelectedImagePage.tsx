import React, { useState } from 'react';

import {
  useDeleteMultipleImages,
  useFetchAllImages,
} from '../../hooks/DeleteImages';
import { Button } from '@/components/ui/button';
import { convertFileSrc } from '@tauri-apps/api/core';

interface DeleteSelectedImageProps {
  setIsVisibleSelectedImage:(value:boolean) => void;
  onError : (title:string,err:any) => void
}



const DeleteSelectedImagePage: React.FC<DeleteSelectedImageProps> = ({
  setIsVisibleSelectedImage,
  onError
}) => {
  const { images: allImagesData, isLoading } = useFetchAllImages();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const { deleteMultipleImages, isLoading: isAddingImages } =
    useDeleteMultipleImages();

  // Extract the array of image paths
  const allImages: string[] = allImagesData??[];

  const toggleImageSelection = (imagePath: string) => {
    setSelectedImages((prev) =>
      prev.includes(imagePath)
        ? prev.filter((path) => path !== imagePath)
        : [...prev, imagePath],
    );
  };

  const handleAddSelectedImages = async () => {
    if (selectedImages.length > 0) {  
      try {
        await deleteMultipleImages(selectedImages);
        console.log("Selected Images : ",selectedImages);
        setSelectedImages([]);
        if(!isLoading) {
            setIsVisibleSelectedImage(true);
        }
      } catch (err) {
        onError('Error during deleting images', err);
      }
    }
  };

  const getImageName = (path: string) => {
    return path.split('\\').pop() || path;
  };

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  if (!Array.isArray(allImages) || allImages.length === 0) {
    return <div>No images available. Please add some images first.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Select Images</h1>
      {/* <FolderPicker setFolderPath={handleFolderPick} /> */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {allImages.map((imagePath, index) => {
          const srcc = convertFileSrc(imagePath);
          return (
            <div key={index} className="relative">
              <div
                className={`absolute -right-2 -top-2 z-10 h-6 w-6 cursor-pointer rounded-full border-2 border-white ${
                  selectedImages.includes(imagePath)
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
                onClick={() => toggleImageSelection(imagePath)}
              />
              <img
                src={srcc}
                alt={`Image ${getImageName(imagePath)}`}
                className="h-40 w-full rounded-lg object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 truncate rounded-b-lg bg-black bg-opacity-50 p-1 text-xs text-white">
                {getImageName(imagePath)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between">
        <Button onClick={()=>setIsVisibleSelectedImage(true)}>Cancel</Button>
        <Button
          onClick={handleAddSelectedImages}
          disabled={isAddingImages || selectedImages.length === 0}
        >
          Delete Selected Images ({selectedImages.length})
        </Button>
      </div>
    </div>
  );
};

export default DeleteSelectedImagePage;
