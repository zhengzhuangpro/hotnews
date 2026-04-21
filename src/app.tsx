import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import type { NewsItem, NewsSource } from "./types.js";
import { sources, getSource } from "./sources/index.js";

function ListSources() {
  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          可用新闻源列表
        </Text>
      </Box>
      {sources.map((s, i) => (
        <Box key={s.id} marginBottom={1}>
          <Text color="yellow" bold>
            {String(i + 1).padStart(2, " ")}.
          </Text>
          <Box flexDirection="column" marginLeft={1}>
            <Box>
              <Text bold>{s.name}</Text>
              <Text dimColor> ({s.id})</Text>
            </Box>
            <Text dimColor>  {s.description}</Text>
          </Box>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>使用 hotnews &lt;源id&gt; 获取热门新闻</Text>
      </Box>
    </Box>
  );
}

function Loading({ name }: { name: string }) {
  return (
    <Box padding={1}>
      <Text color="cyan">⠋</Text>
      <Text> 正在获取 </Text>
      <Text bold>{name}</Text>
      <Text> 热门新闻...</Text>
    </Box>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <Box padding={1}>
      <Text color="red">✗ </Text>
      <Text color="red">{message}</Text>
    </Box>
  );
}

function NewsList({ source, items }: { source: NewsSource; items: NewsItem[] }) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          {source.name}
        </Text>
        <Text dimColor> - {source.description}</Text>
      </Box>
      {items.map((item, i) => (
        <Box key={`${item.rank}-${i}`} marginBottom={0}>
          <Text color="yellow" bold>
            {String(item.rank).padStart(2, " ")}.
          </Text>
          <Text> {item.title}</Text>
          {item.hot && (
            <Text dimColor> ({item.hot})</Text>
          )}
        </Box>
      ))}
    </Box>
  );
}

function Fetcher({ sourceId }: { sourceId: string }) {
  const { exit } = useApp();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const source = getSource(sourceId);

  useEffect(() => {
    if (!source) {
      setError(`未知的新闻源: ${sourceId}`);
      setTimeout(() => exit(), 100);
      return;
    }

    source
      .fetch()
      .then((data) => {
        setItems(data);
        setTimeout(() => exit(), 100);
      })
      .catch((err) => {
        setError(`获取失败: ${err.message}`);
        setTimeout(() => exit(), 100);
      });
  }, [sourceId, source, exit]);

  if (error) return <ErrorMsg message={error} />;
  if (!source) return <ErrorMsg message={`未知的新闻源: ${sourceId}`} />;
  if (!items) return <Loading name={source.name} />;
  return <NewsList source={source} items={items} />;
}

export function App({
  command,
  flags,
}: {
  command: string | undefined;
  flags: { json?: boolean };
}) {
  const { exit } = useApp();

  if (!command) {
    return (
      <Box flexDirection="column" padding={1}>
        <ErrorMsg message="请指定命令。使用 --help 查看帮助信息。" />
      </Box>
    );
  }

  if (command === "list") {
    return <ListSources />;
  }

  const source = getSource(command);
  if (!source) {
    return (
      <Box flexDirection="column" padding={1}>
        <ErrorMsg message={`未知的命令或新闻源: ${command}`} />
        <Text dimColor>使用 hotnews list 查看所有可用源</Text>
      </Box>
    );
  }

  return <Fetcher sourceId={command} />;
}

export async function runApp(
  command: string | undefined,
  flags: { json?: boolean }
) {
  if (flags.json && command && command !== "list") {
    const source = getSource(command);
    if (!source) {
      console.error(`未知的新闻源: ${command}`);
      process.exit(1);
    }
    try {
      const items = await source.fetch();
      console.log(JSON.stringify(items, null, 2));
    } catch (err: any) {
      console.error(`获取失败: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  const { render } = await import("ink");
  const React = await import("react");
  const instance = render(
    React.createElement(App, { command, flags })
  );
  await instance.waitUntilExit();
}
