export interface LegalBlock {
  type: 'p' | 'list' | 'note';
  text?: string;
  items?: string[];
}

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  lead: string;
  edition: string;
  sections: LegalSection[];
}
