import changelogRaw from '../../../CHANGELOG.md?raw';

interface ChangelogEntry {
  type: string;
  text: string;
  prNumber?: string;
  prUrl?: string;
}

interface ChangelogSection {
  date: string;
  entries: ChangelogEntry[];
}

function parseChangelog(raw: string): ChangelogSection[] {
  const sections: ChangelogSection[] = [];
  const parts = raw.split(/^## /m).slice(1);

  for (const part of parts) {
    const lines = part.trim().split('\n');
    const date = lines[0].trim();
    const entries: ChangelogEntry[] = [];

    for (const line of lines.slice(1)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('- ')) continue;
      const content = trimmed.slice(2);

      const typeMatch = content.match(/^\*\*([^*]+)\*\*:\s*(.*)/);
      if (!typeMatch) {
        entries.push({ type: '', text: content });
        continue;
      }

      const type = typeMatch[1];
      const rest = typeMatch[2];
      const prMatch = rest.match(/^(.*?)\s*\(\[#(\d+)\]\(([^)]+)\)\)\s*$/);
      if (prMatch) {
        entries.push({ type, text: prMatch[1].trim(), prNumber: prMatch[2], prUrl: prMatch[3] });
      } else {
        entries.push({ type, text: rest });
      }
    }

    if (entries.length > 0) {
      sections.push({ date, entries });
    }
  }

  return sections;
}

const TYPE_LABELS: Record<string, string> = {
  feat: 'new',
  fix: 'fix',
  refactor: 'refactor',
  perf: 'perf',
  docs: 'docs',
  chore: 'chore',
};

const sections = parseChangelog(changelogRaw);

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangelogModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="changelog-backdrop" onClick={onClose}>
      <div className="changelog-modal" onClick={e => e.stopPropagation()}>
        <div className="changelog-header">
          <span className="changelog-title">What's New in ButterMilk Studio</span>
          <button className="changelog-close" onClick={onClose}>✕</button>
        </div>
        <div className="changelog-body">
          {sections.map(section => (
            <div key={section.date} className="changelog-section">
              <div className="changelog-date">{section.date}</div>
              <ul className="changelog-entries">
                {section.entries.map((entry, i) => (
                  <li key={i} className="changelog-entry">
                    {entry.type && (
                      <span className={`changelog-tag changelog-tag-${entry.type}`}>
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </span>
                    )}
                    <span className="changelog-entry-text">{entry.text}</span>
                    {entry.prNumber && entry.prUrl && (
                      <a
                        className="changelog-pr-link"
                        href={entry.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        #{entry.prNumber}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
