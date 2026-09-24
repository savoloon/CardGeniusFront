export interface FabricTextSnapshot {
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 600 | 700;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  textAlign: 'left' | 'center' | 'right';
  rotation: number;
  backgroundColor: string;
}
