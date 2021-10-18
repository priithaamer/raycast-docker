import { ActionPanel, Color, Detail, Icon, List } from '@raycast/api';
import { useEffect, useMemo, useState } from 'react';
import Dockerode, { ContainerInfo } from '@priithaamer/dockerode';

const containerName = (container: ContainerInfo) => container.Names.map((name) => name.replace(/^\//, '')).join(', ');

export default function ContainerList() {
  const docker = useMemo(() => new Dockerode(), []);

  const [containers, setContainers] = useState<{ containers: ContainerInfo[] }>({ containers: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    async function fetchContainers() {
      setLoading(true);
      try {
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
  }, [docker]);

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
                  shortcut={{ modifiers: ['cmd', 'shift'], key: 'w' }}
                  onAction={async () => {
                    setLoading(true);
                    await docker.getContainer(containerInfo.Id).stop();
                    const containers = await docker.listContainers({ all: true });
                    setContainers({ containers });
                    setLoading(false);
                  }}
                />
              )}
              {containerInfo.State !== 'running' && (
                <ActionPanel.Item
                  title="Start Container"
                  shortcut={{ modifiers: ['cmd', 'shift'], key: 'r' }}
                  onAction={async () => {
                    setLoading(true);
                    await docker.getContainer(containerInfo.Id).start();
                    const containers = await docker.listContainers({ all: true });
                    setContainers({ containers });
                    setLoading(false);
                  }}
                />
              )}
              <ActionPanel.Item
                title="Remove Container"
                icon={Icon.Trash}
                shortcut={{ modifiers: ['cmd', 'shift'], key: 'x' }}
                onAction={async () => {
                  setLoading(true);
                  await docker.getContainer(containerInfo.Id).remove();

                  const containers = await docker.listContainers({ all: true });
                  setContainers({ containers });
                  setLoading(false);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
