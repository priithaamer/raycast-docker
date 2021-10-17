import { ActionPanel, Color, Detail, Icon, List } from '@raycast/api';
import { useEffect, useState } from 'react';
import Dockerode, { ContainerInfo } from '@priithaamer/dockerode';

const containerName = (container: ContainerInfo) => container.Names.map((name) => name.replace(/^\//, '')).join(', ');

export default function ContainerList() {
  const [containers, setContainers] = useState<{ containers: ContainerInfo[] }>({ containers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    async function fetchContainers() {
      setLoading(true);
      try {
        const docker = new Dockerode();
        const containers = await docker.listContainers({ all: true });
        setContainers({ containers });
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchContainers();
  }, []);

  if (error) {
    return <Detail markdown={`## Error connecting to Docker\n\n${error.message}\n`} />;
  }

  return (
    <List isLoading={loading}>
      {containers.containers.map((containerInfo) => (
        <List.Item
          key={containerInfo.Id}
          title={containerName(containerInfo)}
          subtitle={containerInfo.Image}
          accessoryTitle={containerInfo.State}
          icon={{ source: Icon.Terminal, tintColor: containerInfo.State === 'running' ? Color.Green : Color.Red }}
          actions={
            <ActionPanel>
              {containerInfo.State === 'running' && (
                <ActionPanel.Item
                  title="Stop Container"
                  onAction={async () => {
                    const docker = new Dockerode();
                    setLoading(true);
                    const container = docker.getContainer(containerInfo.Id);
                    await container.stop();

                    const containers = await docker.listContainers({ all: true });
                    setContainers({ containers });
                    setLoading(false);
                  }}
                />
              )}
              {containerInfo.State !== 'running' && (
                <ActionPanel.Item
                  title="Start Container"
                  onAction={async () => {
                    const docker = new Dockerode();
                    setLoading(true);
                    const container = docker.getContainer(containerInfo.Id);
                    await container.start();

                    const containers = await docker.listContainers({ all: true });
                    setContainers({ containers });
                    setLoading(false);
                  }}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
