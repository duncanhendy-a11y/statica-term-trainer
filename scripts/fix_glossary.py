"""
Fix stub/useless cards in glossary_all.json.
- Deletes non-structural cards (SSO, EOP, FAQ, PDF, sample projects)
- Replaces formatting-note definitions with proper technical definitions
- Strips em dashes (—) from definitions and replaces with hyphens or colons
"""
import json, re, uuid, sys
from pathlib import Path

SRC = Path(__file__).parent.parent / "public/data/glossary_all.json"

with open(SRC) as f:
    cards = json.load(f)

# ── 1. Terms to delete entirely (non-structural / housekeeping) ──────────────
DELETE_TERMS = {
    "SSO", "EOP", "FAQ", "PDF", "sample projects",
}

# ── 2. Proper definitions to inject ─────────────────────────────────────────
REPLACE_DEFS = {
    "steel-to-timber connection": (
        "Connections, Members & Components",
        "intermediate",
        "A structural joint connecting a steel member to a timber or glulam element, "
        "typically using bolts, screws, or epoxy anchors. Used in hybrid construction "
        "where steel and timber elements share loads."
    ),
    "steel-to-glulam": (
        "Connections",
        "intermediate",
        "A connection between a steel element and glued laminated timber (glulam). "
        "Commonly achieved with bolted plates, epoxy rods, or hidden fasteners. "
        "Requires careful detailing for moisture and fire exposure."
    ),
    "weld / welded": (
        "Connections",
        "beginner",
        "A method of permanently joining steel elements by fusing them with heat, "
        "typically from an electric arc. Welds are classified by type (fillet, butt, "
        "full-penetration) and designed to transfer forces between connected parts."
    ),
    "bolt / bolted": (
        "Members & Components",
        "beginner",
        "A threaded fastener used to connect structural elements. Structural bolts are "
        "typically high-strength grades (8.8 or 10.9) and may be designed to resist "
        "shear, tension, or combined loading depending on the connection type."
    ),
    "metal deck slab": (
        "Members & Components",
        "intermediate",
        "A composite floor system comprising a profiled steel deck acting as permanent "
        "formwork for a concrete slab. When shear connectors are provided, the deck "
        "acts compositely with the concrete to increase stiffness and capacity."
    ),
    "discontinuity region": (
        "Structural Behaviour",
        "advanced",
        "A zone in a structure where the assumption that plane sections remain plane "
        "breaks down. Occurs near point loads, supports, openings, and geometry "
        "changes. Also called a D-region; analysed using strut-and-tie models."
    ),
    "reinforcement": (
        "Members & Components",
        "beginner",
        "Steel bars or fabric embedded in concrete to carry tensile forces. In "
        "reinforced concrete design, concrete resists compression while reinforcement "
        "resists tension. Specified by bar diameter, grade (e.g. B500B), and layout."
    ),
    "rebar / rebars": (
        "Members & Components",
        "beginner",
        "Short for reinforcing bar. Deformed steel rods embedded in concrete to resist "
        "tensile and shear forces. Common grades include B500B (Eurocode) and Grade 60 "
        "(ASTM). Diameter ranges from 6 mm to 40 mm."
    ),
    "corbel": (
        "Members & Components",
        "intermediate",
        "A short cantilever bracket projecting from a concrete or steel column to "
        "support a beam, precast element, or runway beam. Corbels are designed using "
        "strut-and-tie models and are governed by shear-friction behaviour."
    ),
    "linear buckling analysis": (
        "Analysis & Software",
        "intermediate",
        "An eigenvalue analysis that determines the theoretical elastic critical load "
        "multiplier at which a structure becomes unstable. Also called LBA. Results "
        "quantify buckling risk but do not account for imperfections or material "
        "nonlinearity; higher-order analyses are needed for realistic assessment."
    ),
    "fire design": (
        "General Concepts",
        "intermediate",
        "The process of verifying that a structure retains adequate load-bearing "
        "capacity and integrity during a fire. Approaches include prescriptive "
        "(tabulated data), simplified calculation, and advanced thermal-structural FEA "
        "per Eurocode EN 1993-1-2 (steel) or EN 1992-1-2 (concrete)."
    ),
    "fire resistance check": (
        "General Concepts",
        "intermediate",
        "A verification that a structural member or connection can withstand a defined "
        "fire exposure (R30, R60, R90, etc.) without collapse. Considers reduced "
        "material yield strength and stiffness at elevated temperature."
    ),
    "seismic design": (
        "General Concepts",
        "intermediate",
        "Design of a structure to resist earthquake-induced inertial forces. Key "
        "concepts include ductility, energy dissipation, capacity design, and seismic "
        "action spectra per Eurocode EN 1998. Connections must remain ductile under "
        "reversed cyclic loading."
    ),
    "bearing capacity": (
        "Forces & Loads",
        "beginner",
        "The maximum compressive force a structural element or soil can sustain in "
        "direct bearing before yielding, crushing, or punching through. In bolted "
        "connections, bearing capacity governs when the bolt presses against the plate "
        "hole edge."
    ),
    "compression softening": (
        "Structural Behaviour",
        "advanced",
        "The reduction in compressive strength of cracked reinforced concrete in the "
        "direction perpendicular to an existing crack. Tensile cracking in one "
        "direction reduces the concrete's ability to carry compression in another, "
        "and must be accounted for in non-linear FEA."
    ),
    "bill of materials": (
        "General Concepts",
        "beginner",
        "A complete list of all reinforcement bars or structural components in a "
        "design, including diameter, length, quantity, bending shape, and total mass. "
        "Used for material procurement and workshop fabrication."
    ),
    "cold-formed sections": (
        "Members & Components",
        "intermediate",
        "Structural steel sections manufactured by cold-rolling or press-braking flat "
        "sheet steel at room temperature. Common shapes include C, Z, and sigma "
        "sections. Thinner than hot-rolled equivalents; governed by EN 1993-1-3."
    ),
    "CHS (Circular Hollow Section)": (
        "Members & Components",
        "beginner",
        "A steel tube with a circular cross-section, specified by outer diameter and "
        "wall thickness (e.g. CHS 168.3x10). Efficient in compression and torsion; "
        "used as columns, bracing, and truss chords. Governed by EN 1993-1-1."
    ),
    "fatigue analysis": (
        "Analysis & Software",
        "advanced",
        "Assessment of a structure's resistance to failure under repeated cyclic "
        "loading. Fatigue cracks typically initiate at stress concentrations such as "
        "weld toes and grow under fluctuating stress ranges. Governed by "
        "EN 1993-1-9 (steel) using S-N curves and damage accumulation."
    ),
    "Mortar joint": (
        "Members & Components",
        "beginner",
        "A layer of mortar between masonry units (bricks, blocks, or stones) that "
        "bonds them and transfers compressive and shear forces. Joint thickness, "
        "mortar strength, and detailing affect the load capacity and deformation "
        "behaviour of masonry walls."
    ),
    "MNA": (
        "Analysis & Software",
        "intermediate",
        "Materially Nonlinear Analysis. A finite element analysis that models material "
        "yielding and plastic behaviour while assuming geometry remains unchanged "
        "(small-displacement theory). Used in IDEA StatiCa to determine connection "
        "plastic resistance."
    ),
    "DWG": (
        "Analysis & Software",
        "beginner",
        "The proprietary binary CAD file format native to AutoCAD, widely used for 2D "
        "and 3D structural drawings. Structural detailing offices exchange fabrication "
        "drawings in DWG format; most BIM and structural software can import it."
    ),
    "EPM": (
        "Connections",
        "intermediate",
        "End Plate Moment connection. A bolted beam-to-column joint where a plate "
        "welded to the beam end is bolted to the column flange. Designed to transfer "
        "bending moment, shear, and axial force. Can be partial- or full-depth "
        "depending on the required moment resistance."
    ),
    "AISC 360-22": (
        "Design Codes",
        "intermediate",
        "The 2022 edition of the AISC Specification for Structural Steel Buildings "
        "- the primary US standard governing the design of structural steel members "
        "and connections. Covers both LRFD (load and resistance factor design) and "
        "ASD (allowable strength design) methods."
    ),
}

# ── Process ──────────────────────────────────────────────────────────────────
before = len(cards)
kept = []
deleted = []
updated = []

for card in cards:
    term = card["term"]

    # Delete non-structural
    if term in DELETE_TERMS:
        deleted.append(term)
        continue

    # Replace definition if we have a proper one
    if term in REPLACE_DEFS:
        cat_override, diff, new_def = REPLACE_DEFS[term]
        card["definition"] = new_def
        card["difficulty"] = diff
        updated.append(term)

    # Strip em dashes from definition
    if "—" in card.get("definition", ""):
        card["definition"] = card["definition"].replace("—", " - ")

    kept.append(card)

after = len(kept)

with open(SRC, "w") as f:
    json.dump(kept, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"Before: {before} cards")
print(f"Deleted ({len(deleted)}): {deleted}")
print(f"Updated ({len(updated)}): {updated}")
print(f"After:  {after} cards")
