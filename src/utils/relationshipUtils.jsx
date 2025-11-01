// --- Relationship Type Display Names ---
const relationshipDisplayNames = {
    AS_DOCUMENT: "Published by Government",
    AMENDS: "Amends",
    REFERS_TO: "Refers To",
    REFERENCES: "References",
    AFFECTS: "Affects",
    DEFAULT: "Related To",
  };
  
  // --- Get Readable Relationship Name ---
  export function getReadableRelationshipName(type) {
    return (
      relationshipDisplayNames[type] ||
      type.replace(/_/g, " ").toLowerCase()
    );
  }
  