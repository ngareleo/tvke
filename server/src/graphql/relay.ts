// Relay requires globally unique IDs encoded as base64("TypeName:localId")

export function toGlobalId(type: string, id: string | number): string {
  return Buffer.from(`${type}:${id}`).toString("base64");
}

export function fromGlobalId(globalId: string): { type: string; id: string } {
  const decoded = Buffer.from(globalId, "base64").toString("utf8");
  const colonIndex = decoded.indexOf(":");
  return {
    type: decoded.slice(0, colonIndex),
    id: decoded.slice(colonIndex + 1),
  };
}
