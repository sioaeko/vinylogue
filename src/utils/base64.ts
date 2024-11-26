// Simple base64 encoding function for browser environments
export function btoa(str: string): string {
  try {
    return window.btoa(str);
  } catch (err) {
    // Fallback for non-ASCII characters
    return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(_match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
  }
}