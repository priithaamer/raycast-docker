import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import Dockerode, { ContainerInfo } from "dockerode";

export default function ContainerList() {
  const [containers, setContainers] = useState<{ containers: ContainerInfo[] }>({ containers: [] });

  useEffect(() => {
    async function fetchContainers() {
      const docker = new Dockerode();
      const containers = await docker.listContainers();
      setContainers({ containers });
    }
    fetchContainers();
  }, []);

  return (
    <List>
      {containers.containers.map((container) => (
        <List.Item key={container.Id} title={container.Names.join(", ")} />
      ))}
    </List>
  );
}
