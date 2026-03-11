import { Command } from "commander";
import { createSpaceCommand } from "./commands/space.js";
import { createIssuesCommand, createIssueCommand } from "./commands/issues.js";
import { createProjectsCommand } from "./commands/projects.js";
import { createCommentsCommand } from "./commands/comments.js";
import { createMeCommand } from "./commands/me.js";

const program = new Command();

program
  .name("backlog")
  .description("Backlog CLI ツール - AIエージェント向け")
  .version("1.0.0");

program.addCommand(createSpaceCommand());
program.addCommand(createIssuesCommand());
program.addCommand(createIssueCommand());
program.addCommand(createProjectsCommand());
program.addCommand(createCommentsCommand());
program.addCommand(createMeCommand());

program.parseAsync().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
