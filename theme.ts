import { Theme, FontSize } from './types';

export const FONT_SIZES: Record<FontSize, string> = {
  small: 'text-[10pt]',
  medium: 'text-[11pt]',
  large: 'text-[13pt]',
};

export const THEMES: Record<Theme, {
  bgApp: string;
  bgCard: string;
  textMain: string;
  textMuted: string; // For labels, less important text
  textHeader: string; // For titles
  textHighlight: string; // For results/bold
  borderCard: string;
  borderDivider: string;
  input: string;
  inputDisabled: string;
  inputLabel: string;
  checkboxText: string;
  buttonPrimary: string;
  tableBorder: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableRowAlt: string; // Alternating row color
  tableRowNormal: string;
  resultLabel: string; // "LƯƠNG NET"
  resultValue: string;
  sectionTitleBorder: string;
  disclaimerBg: string;
  disclaimerBorder: string;
  disclaimerText: string;
  toggleOn: string;
  toggleOff: string;
  toggleDot: string;
  accentColor: string; // For radios/checkboxes (text class)
}> = {
  light: {
    bgApp: 'bg-blue-50',
    bgCard: 'bg-white',
    textMain: 'text-gray-800',
    textMuted: 'text-gray-600',
    textHeader: 'text-green-700',
    textHighlight: 'text-green-700',
    borderCard: 'border border-blue-200',
    borderDivider: 'border-blue-100',
    input: 'bg-white border border-blue-300 focus:border-green-600 text-gray-900',
    inputDisabled: 'bg-gray-100 text-gray-500 border border-blue-200',
    inputLabel: 'text-blue-900',
    checkboxText: 'text-gray-600',
    buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
    tableBorder: 'border-blue-200',
    tableHeaderBg: 'bg-blue-100',
    tableHeaderText: 'text-blue-900',
    tableRowAlt: 'bg-blue-50',
    tableRowNormal: 'bg-white',
    resultLabel: 'text-green-800',
    resultValue: 'text-green-800',
    sectionTitleBorder: 'border-green-600',
    disclaimerBg: 'bg-yellow-50',
    disclaimerBorder: 'border-yellow-200',
    disclaimerText: 'text-yellow-800',
    toggleOn: 'bg-green-600',
    toggleOff: 'bg-gray-300',
    toggleDot: 'bg-white',
    accentColor: 'text-green-600',
  },
  dark: {
    bgApp: 'bg-gray-900',
    bgCard: 'bg-gray-800',
    textMain: 'text-gray-300',
    textMuted: 'text-gray-400',
    textHeader: 'text-green-400',
    textHighlight: 'text-green-400',
    borderCard: 'border border-gray-700',
    borderDivider: 'border-gray-700',
    input: 'bg-gray-700 border border-gray-600 focus:border-green-500 text-white',
    inputDisabled: 'bg-gray-800 text-gray-500 border border-gray-700',
    inputLabel: 'text-gray-200',
    checkboxText: 'text-gray-400',
    buttonPrimary: 'bg-green-700 hover:bg-green-600 text-white',
    tableBorder: 'border-gray-700',
    tableHeaderBg: 'bg-gray-700',
    tableHeaderText: 'text-gray-200',
    tableRowAlt: 'bg-gray-700/50',
    tableRowNormal: 'bg-gray-800',
    resultLabel: 'text-green-400',
    resultValue: 'text-green-400',
    sectionTitleBorder: 'border-green-500',
    disclaimerBg: 'bg-yellow-900/20',
    disclaimerBorder: 'border-yellow-700/50',
    disclaimerText: 'text-yellow-200',
    toggleOn: 'bg-green-600',
    toggleOff: 'bg-gray-600',
    toggleDot: 'bg-gray-200',
    accentColor: 'text-green-500',
  },
  contrast: {
    bgApp: 'bg-white',
    bgCard: 'bg-white',
    textMain: 'text-black',
    textMuted: 'text-black',
    textHeader: 'text-black underline decoration-2',
    textHighlight: 'text-black font-extrabold',
    borderCard: 'border-2 border-black shadow-none',
    borderDivider: 'border-black',
    input: 'bg-white border-2 border-black focus:ring-2 focus:ring-black text-black placeholder-gray-500',
    inputDisabled: 'bg-gray-200 text-black border-2 border-dashed border-black',
    inputLabel: 'text-black font-bold',
    checkboxText: 'text-black font-bold',
    buttonPrimary: 'bg-black text-yellow-300 border-2 border-black hover:bg-yellow-300 hover:text-black hover:border-black font-bold',
    tableBorder: 'border-black',
    tableHeaderBg: 'bg-black',
    tableHeaderText: 'text-yellow-300 font-bold',
    tableRowAlt: 'bg-gray-200',
    tableRowNormal: 'bg-white',
    resultLabel: 'text-black underline decoration-2',
    resultValue: 'text-black font-black',
    sectionTitleBorder: 'border-black',
    disclaimerBg: 'bg-white',
    disclaimerBorder: 'border-2 border-black',
    disclaimerText: 'text-black font-bold italic',
    toggleOn: 'bg-black',
    toggleOff: 'bg-gray-200 border-2 border-black',
    toggleDot: 'bg-yellow-300 border border-black',
    accentColor: 'text-black',
  }
};