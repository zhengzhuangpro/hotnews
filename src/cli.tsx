import meow from "meow";
import { runApp } from "./app.js";
import { sources } from "./sources/index.js";

const sourceIds = sources.map((s) => s.id);
const sourceList = sources.map((s) => `    ${s.id.padEnd(10)} ${s.name} - ${s.description}`).join("\n");

const cli = meow(
  `
  Usage
    $ hotnews <command> [options]

  Commands
    list       显示所有可用的新闻源

  新闻源
${sourceList}

  Options
    --json     以 JSON 格式输出
    --limit    指定显示条数 (默认: 10, 最大: 50)
    --help     显示帮助信息

  Examples
    $ hotnews list
    $ hotnews baidu
    $ hotnews weibo --json
    $ hotnews weibo --limit 5
    $ hotnews douyin -l 15
`,
  {
    importMeta: import.meta,
    autoHelp: true,
    flags: {
      json: {
        type: "boolean",
        default: false,
      },
      limit: {
        type: "number",
        shortFlag: "l",
        default: 10,
      },
    },
  }
);

const command = cli.input[0];

runApp(command, cli.flags).catch((err) => {
  console.error(err);
  process.exit(1);
});
