import { List } from '@raycast/api';
import { useEffect, useState } from 'react';
import Dockerode, { ImageInfo } from '@priithaamer/dockerode';

export default function ImageList() {
  const [images, setImages] = useState<{ images: ImageInfo[] }>({ images: [] });

  useEffect(() => {
    async function fetchContainers() {
      const docker = new Dockerode();
      const images = await docker.listImages();
      setImages({ images });
    }
    fetchContainers();
  }, []);

  return (
    <List>
      {images.images.map((image) => (
        <List.Item key={image.Id} title={image.RepoTags.join(', ')} />
      ))}
    </List>
  );
}
