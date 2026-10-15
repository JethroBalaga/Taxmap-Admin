# generate_taxmap_docs.py
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print total page numbers:
    'Page X of Y' along with a professional running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip cover page
            return
        
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#4B5563"))
        
        # Running Header
        self.drawString(54, 752, "TAXMAP SYSTEM: TECHNICAL SPECIFICATION & TAX CALCULATION MANUAL")
        self.setFont("Helvetica", 8)
        self.drawRightString(558, 752, "LGU Manolo Fortich, Bukidnon")
        
        # Header rule line
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 746, 558, 746)
        
        # Footer rule line
        self.line(54, 48, 558, 48)
        
        # Running Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 36, "Confidential - Municipal Assessor & Information Services Office (MISO)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.restoreState()


def create_taxmap_pdf(output_path):
    # 54pt = 0.75 in margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Palettes
    PRIMARY = colors.HexColor("#0F294A")      # Dark Navy
    SECONDARY = colors.HexColor("#1E56A0")    # Classic Rich Blue
    ACCENT = colors.HexColor("#0D9488")       # Teal
    DARK_TEXT = colors.HexColor("#1E293B")    # Slate 800
    MUTED_TEXT = colors.HexColor("#64748B")   # Slate 500
    BG_LIGHT = colors.HexColor("#F8FAFC")     # Slate 50
    CARD_BG = colors.HexColor("#F1F5F9")      # Slate 100
    BORDER_COLOR = colors.HexColor("#E2E8F0") # Slate 200
    SUCCESS = colors.HexColor("#166534")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=SECONDARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=DARK_TEXT,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=DARK_TEXT,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=DARK_TEXT
    )

    formula_style = ParagraphStyle(
        'FormulaText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=DARK_TEXT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=DARK_TEXT
    )

    story = []

    # =========================================================================
    # COVER / TITLE BLOCK
    # =========================================================================
    story.append(Spacer(1, 15))
    story.append(Paragraph("MUNICIPAL GOVERNMENT OF MANOLO FORTICH, BUKIDNON", ParagraphStyle(
        'GovHeader', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=SECONDARY, spaceAfter=4
    )))
    story.append(Paragraph("MUNICIPAL ASSESSOR'S OFFICE & INFORMATION SERVICES OFFICE (MISO)", ParagraphStyle(
        'OfficeSub', fontName='Helvetica', fontSize=8.5, leading=11, textColor=MUTED_TEXT, spaceAfter=15
    )))
    story.append(HRFlowable(width="100%", thickness=3, color=PRIMARY, spaceAfter=15))

    story.append(Paragraph("TAXMAP SYSTEM SPECIFICATION & TAX CALCULATION ENGINE MANUAL", title_style))
    story.append(Paragraph("An Offline-First GIS Mobile & Desktop Real Property Tax (RPT) Mapping, Assessment, Appraisal & Revenue Administration Architecture", subtitle_style))

    # Metadata card
    meta_data = [
        [
            Paragraph("<b>System Name:</b> Taxmap Ecosystem", table_cell_style),
            Paragraph("<b>Target LGU:</b> Manolo Fortich, Bukidnon", table_cell_style)
        ],
        [
            Paragraph("<b>Module:</b> Mobile Field App & Admin", table_cell_style),
            Paragraph("<b>Author / Intern:</b> Jethro Balaga (OJT)", table_cell_style)
        ],
        [
            Paragraph("<b>Tech Stack:</b> Ionic, React, Capacitor, Leaflet, Supabase", table_cell_style),
            Paragraph("<b>Legal Basis:</b> Local Government Code (RA 7160)", table_cell_style)
        ],
        [
            Paragraph("<b>Documentation Version:</b> 1.0 (Production)", table_cell_style),
            Paragraph("<b>Publication Date:</b> October 2026", table_cell_style)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))

    # Executive Overview
    story.append(Paragraph("EXECUTIVE SUMMARY", h2_style))
    story.append(Paragraph(
        "The <b>Taxmap System</b> is a digital municipal transformation solution engineered to modernize real property appraisal, cadastral mapping, and local tax administration. Field assessors deployed across rural barangays often face significant barriers including zero cellular reception, manual paper-based assessment records, and error-prone mathematical calculations. The Taxmap ecosystem addresses these critical bottlenecks by providing a high-performance, offline-first mobile application paired with a centralized desktop management suite and spatial GIS database.",
        body_style
    ))
    story.append(Paragraph(
        "This document details the architectural foundation, end-to-end operational workflows, complete feature inventory, offline data synchronization protocols, and the mathematical formulas governing land, building, and machinery real property tax assessments under Philippine Municipal Assessor guidelines.",
        body_style
    ))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=15))

    # =========================================================================
    # SECTION 1: ARCHITECTURAL ECOSYSTEM
    # =========================================================================
    story.append(Paragraph("1. SYSTEM ARCHITECTURE & COMPONENT ROLES", h1_style))
    story.append(Paragraph(
        "The municipal land and tax administration infrastructure operates through three specialized, interconnected systems that form a continuous data pipeline:",
        body_style
    ))

    arch_data = [
        [
            Paragraph("System Subsystem", table_header_style),
            Paragraph("Target Environment", table_header_style),
            Paragraph("Primary Technology", table_header_style),
            Paragraph("Operational Responsibilities", table_header_style)
        ],
        [
            Paragraph("<b>Taxmap (Mobile App)</b>", table_cell_bold),
            Paragraph("Field Mobile / Tablet<br/>(Android & iOS via Capacitor)", table_cell_style),
            Paragraph("Ionic React 8, React 19,<br/>Leaflet, LocalForage, Supabase", table_cell_style),
            Paragraph("On-site property surveys, camera photo capture, GPS coordinate tagging, offline appraisal calculation, and local storage persistence.", table_cell_style)
        ],
        [
            Paragraph("<b>Taxmap-Admin</b>", table_cell_bold),
            Paragraph("Municipal Office<br/>(Desktop Electron Application)", table_cell_style),
            Paragraph("Electron, Ionic React, Vite,<br/>Chart.js, Supabase Client", table_cell_style),
            Paragraph("Executive dashboard, review of submitted field appraisals, user authentication, role assignment, audit log inspection, and master spatial viewing.", table_cell_style)
        ],
        [
            Paragraph("<b>TAX MAP MISO (Portal)</b>", table_cell_bold),
            Paragraph("Central Web Portal<br/>(Municipal Network / Cloud)", table_cell_style),
            Paragraph("Laravel 10, Livewire 3,<br/>MapLibre GL, Tailwind, MySQL", table_cell_style),
            Paragraph("Full cadastral GIS parcel mapping, PIN lookup, Accountable Forms (Form 56 RPT, Form 51, CTC), payment collection recording, and serial sequence audit.", table_cell_style)
        ]
    ]
    t_arch = Table(arch_data, colWidths=[95, 95, 110, 204])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 2: MOBILE FIELD APPLICATION (TAXMAP)
    # =========================================================================
    story.append(Paragraph("2. FIELD APP (TAXMAP) FEATURES & WORKFLOW", h1_style))
    story.append(Paragraph(
        "The field client is structured around 4 major modules engineered specifically for rapid, fail-safe operation in rugged field conditions:",
        body_style
    ))

    story.append(Paragraph("2.1. Spatial GIS Mapping & Geotagging Module (Map.tsx & MapCon.tsx)", h2_style))
    story.append(Paragraph(
        "• <b>Geographic Bounding:</b> Hardcoded bounding coordinates lock the viewport specifically to Manolo Fortich, Bukidnon (Latitude 8.25° to 8.45° N, Longitude 124.75° to 124.95° E) to avoid accidental disorienting pans.<br/>"
        "• <b>Dual Layer Basemaps:</b> Seamless toggle between OpenStreetMap vector street tiles and high-resolution ESRI ArcGIS World Imagery satellite photography.<br/>"
        "• <b>Offline Map Tile Caching:</b> Powered by <code>leaflet.offline</code> and IndexedDB storage, enabling field agents to browse satellite imagery even with Airplane Mode enabled.<br/>"
        "• <b>Real-Time GPS Marker Drop:</b> Field mappers tap the screen or use the current GPS location to drop a property pin, automatically capturing exact coordinates.<br/>"
        "• <b>Visual Property Categorization:</b> Custom marker pins render distinct visual icons depending on the property kind (Land, Building, or Machinery).<br/>"
        "• <b>Interactive Property Cards:</b> Clicking any marker launches a slide-up card displaying the Declared Owner, Property Kind, Assessed Value, and on-site photos.",
        bullet_style
    ))

    story.append(Paragraph("2.2. Camera & Native Hardware Bridge (PhotoModal.tsx)", h2_style))
    story.append(Paragraph(
        "• <b>Native Shutter Integration:</b> Uses <code>@capacitor/camera</code> to invoke the device's physical camera hardware.<br/>"
        "• <b>Simultaneous Geotagging:</b> At the exact millisecond a photo is captured, <code>@capacitor/geolocation</code> samples high-accuracy satellite GPS coordinates.<br/>"
        "• <b>Filesystem Isolation:</b> Stores compressed photographic proofs locally in private application sandbox storage via <code>@capacitor/filesystem</code>.<br/>"
        "• <b>Relational Association:</b> The captured photo is assigned a unique UUID and bound to the property appraisal form via a relational bridge entity (<code>value_info</code>).",
        bullet_style
    ))

    story.append(Paragraph("2.3. Offline Local Database Architecture (Storage.tsx)", h2_style))
    story.append(Paragraph(
        "To ensure zero data loss during power loss or app termination, Taxmap deploys an offline-first storage mesh powered by LocalForage (IndexedDB). Pre-cached municipal reference tables include:",
        body_style
    ))

    tables_data = [
        [
            Paragraph("IndexedDB Store", table_header_style),
            Paragraph("Cached Dataset", table_header_style),
            Paragraph("Function in Appraisal Workflow", table_header_style)
        ],
        [
            Paragraph("<code>FormDataDB</code>", table_cell_bold),
            Paragraph("Field Assessment Forms", table_cell_style),
            Paragraph("Stores master property records, owners, areas, kinds, and upload statuses.", table_cell_style)
        ],
        [
            Paragraph("<code>PhotoTagApp</code>", table_cell_bold),
            Paragraph("Photos & ValueInfo Relations", table_cell_style),
            Paragraph("Holds GPS coordinates, timestamps, and relational foreign keys to forms.", table_cell_style)
        ],
        [
            Paragraph("<code>TaxAppStorage</code>", table_cell_bold),
            Paragraph("Assessment Levels & Tax Rates", table_cell_style),
            Paragraph("Reference tables containing legal assessment level % and municipal tax rates.", table_cell_style)
        ],
        [
            Paragraph("<code>BuildingDataDB</code>", table_cell_bold),
            Paragraph("Building Specs & Subcomponents", table_cell_style),
            Paragraph("Stores floor storeys, age, building codes, completion %, and subcomponent items.", table_cell_style)
        ],
        [
            Paragraph("<code>MachineDataStorage</code>", table_cell_bold),
            Paragraph("Machinery Valuation Records", table_cell_style),
            Paragraph("Records acquisition costs, freight, insurance, installation, and depreciation.", table_cell_style)
        ],
        [
            Paragraph("<code>AgriculturalDataDB</code>", table_cell_bold),
            Paragraph("Agricultural Land Factors", table_cell_style),
            Paragraph("Maintains frontage, road type, and trading center distance adjustment %.", table_cell_style)
        ]
    ]
    t_tables = Table(tables_data, colWidths=[120, 150, 234])
    t_tables.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tables)
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 3: MATHEMATICAL VALUATION & TAX CALCULATION ENGINE
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. REAL PROPERTY TAX (RPT) VALUATION & CALCULATION ENGINE", h1_style))
    story.append(Paragraph(
        "The calculation engine implemented within the Taxmap codebase strictly adheres to the valuation methodologies established by the <b>Local Government Code of 1991 (Republic Act No. 7160)</b> and the Schedule of Fair Market Values (SFMV) of Manolo Fortich, Bukidnon.",
        body_style
    ))

    # Core Appraisal Flow Diagram Card
    calc_intro = [
        [
            Paragraph("<b>STANDARD APPRAISAL SEQUENCE:</b><br/>"
                      "1. Determine Base Market Value (BMV) → "
                      "2. Apply Location / Depreciation Adjustments (AMV) → "
                      "3. Multiply by Assessment Level Schedule (AV) → "
                      "4. Calculate Annual Basic Real Property Tax & Special Education Fund (SEF)", callout_style)
        ]
    ]
    t_calc_intro = Table(calc_intro, colWidths=[504])
    t_calc_intro.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, SECONDARY),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_calc_intro)
    story.append(Spacer(1, 10))

    # 3.1 AGRICULTURAL LAND
    story.append(Paragraph("3.1. Agricultural Land Valuation Engine", h2_style))
    story.append(Paragraph(
        "Source File: <code>src/pages/Formstabs/agriculturalUtils.ts</code> and <code>useAgriculturalData.ts</code>",
        ParagraphStyle('SrcRef', fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED_TEXT, spaceAfter=4)
    ))
    story.append(Paragraph(
        "Agricultural land valuation starts with a base unit rate per hectare or square meter determined by subclass (e.g., Riceland Irrigated, Cornland, Pineapple plantation, Sugarcane, Coconut, Pastureland), then adjusts for road access and transport proximity.",
        body_style
    ))

    agri_formulas = [
        [
            Paragraph("<b>1. Base Market Value (BMV):</b>", table_cell_bold),
            Paragraph("<code>BMV = Area (ha or sq.m) × Subclass Base Unit Rate</code>", formula_style)
        ],
        [
            Paragraph("<b>2. Total Adjustment Factor (TAF):</b>", table_cell_bold),
            Paragraph("<code>TAF% = Frontage% + All-Weather Road% + Trading Market%</code>", formula_style)
        ],
        [
            Paragraph("<b>3. Adjusted Market Value (AMV):</b>", table_cell_bold),
            Paragraph("<code>AMV = BMV × (1 + (TAF% / 100))</code><br/><i>(Negative adjustment reduces value; positive increases value)</i>", formula_style)
        ],
        [
            Paragraph("<b>4. Assessed Value (AV):</b>", table_cell_bold),
            Paragraph("<code>AV = AMV × Assessment Level (Agri Land standard: 40%)</code>", formula_style)
        ]
    ]
    t_agri = Table(agri_formulas, colWidths=[170, 334])
    t_agri.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_agri)
    story.append(Spacer(1, 6))

    story.append(Paragraph(
        "<b>Worked Example (Agricultural Land):</b><br/>"
        "• <i>Property:</i> 2.5 Hectares Cornland (Subclass C-1) in Barangay Tankulan.<br/>"
        "• <i>Base Unit Rate:</i> ₱120,000.00 / hectare.<br/>"
        "• <code>BMV = 2.5 × 120,000 = ₱300,000.00</code><br/>"
        "• <i>Adjustments:</i> Frontage on Provincial Road (+5%), All-Weather Gravel (+0%), 6 km from Municipal Market (-6%).<br/>"
        "• <code>TAF = +5% + 0% - 6% = -1%</code><br/>"
        "• <code>AMV = ₱300,000.00 × (1 - 0.01) = ₱297,000.00</code><br/>"
        "• <code>AV = ₱297,000.00 × 40% = ₱118,800.00</code>",
        callout_style
    ))
    story.append(Spacer(1, 10))

    # 3.2 NON-AGRICULTURAL LAND
    story.append(Paragraph("3.2. Non-Agricultural Land Valuation (Residential, Commercial, Industrial)", h2_style))
    story.append(Paragraph(
        "Source File: <code>src/pages/Formstabs/useNonAgriCalculations.ts</code>",
        ParagraphStyle('SrcRef2', fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED_TEXT, spaceAfter=4)
    ))
    story.append(Paragraph(
        "Urban and commercial parcels evaluate depth factors, corner street premiums, and commercial strip frontage.",
        body_style
    ))

    nonagri_formulas = [
        [
            Paragraph("Adjustment Factor", table_header_style),
            Paragraph("Mathematical Formula Implemented", table_header_style),
            Paragraph("Economic Rationale", table_header_style)
        ],
        [
            Paragraph("<b>Base Market Value</b>", table_cell_bold),
            Paragraph("<code>BMV = Area (sq.m) × Base Rate/sq.m</code>", formula_style),
            Paragraph("Standard lot area multiplied by zonal valuation unit rate.", table_cell_style)
        ],
        [
            Paragraph("<b>Corner Influence</b>", table_cell_bold),
            Paragraph("<code>Adj = Base Rate × Factor% × Area</code>", formula_style),
            Paragraph("Premium added for lots situated on street intersections.", table_cell_style)
        ],
        [
            Paragraph("<b>Stripping (Depth)</b>", table_cell_bold),
            Paragraph("<code>Adj = Base Rate × Factor% × StripArea</code>", formula_style),
            Paragraph("Devalues land area situated beyond standard depth limits (e.g. >30m).", table_cell_style)
        ],
        [
            Paragraph("<b>Commercial Frontage</b>", table_cell_bold),
            Paragraph("<code>Adj = Factor% × (0.5 × Base Rate)</code>", formula_style),
            Paragraph("Additional value for prominent display frontage on main roads.", table_cell_style)
        ],
        [
            Paragraph("<b>Adjusted Market Value</b>", table_cell_bold),
            Paragraph("<code>AMV = BMV + Σ Value Adjustments</code>", formula_style),
            Paragraph("Net market value prior to assessment level conversion.", table_cell_style)
        ]
    ]
    t_nonagri = Table(nonagri_formulas, colWidths=[120, 210, 174])
    t_nonagri.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_nonagri)
    story.append(Spacer(1, 12))

    # 3.3 BUILDING & STRUCTURAL APPRAISAL
    story.append(Paragraph("3.3. Building & Structural Appraisal Engine", h2_style))
    story.append(Paragraph(
        "Source File: <code>src/pages/Formstabs/BuildingTableLogic.ts</code>",
        ParagraphStyle('SrcRef3', fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED_TEXT, spaceAfter=4)
    ))
    story.append(Paragraph(
        "Buildings are valued using the Replacement Cost New (RCN) less Depreciation approach. Subcomponents (special tiles, custom structural frames, extra plumbing, decorative ceilings) are evaluated individually.",
        body_style
    ))

    bldg_formulas = [
        [
            Paragraph("Step 1: Building Base Replacement Cost New (RCN)", table_cell_bold),
            Paragraph("<code>BMV = Base Area × Storey Count × Building Code Base Rate</code>", formula_style)
        ],
        [
            Paragraph("Step 2: Subcomponent Adjustments (Fixed Rate Mode)", table_cell_bold),
            Paragraph("<code>Adj_Value = Subcomponent Area × Subcomponent Rate</code>", formula_style)
        ],
        [
            Paragraph("Step 3: Subcomponent Adjustments (Percentage Mode)", table_cell_bold),
            Paragraph("<code>Adj_Value = BMV × (Subcomponent Rate% / 100)</code>", formula_style)
        ],
        [
            Paragraph("Step 4: Subcomponent Completion & Depreciation", table_cell_bold),
            Paragraph("<code>Net_Adj = Adj_Value × (Completion% / 100) × (1 - (Depreciation% / 100))</code>", formula_style)
        ],
        [
            Paragraph("Step 5: Final Adjusted Market Value (AMV)", table_cell_bold),
            Paragraph("<code>AMV = (BMV × (1 - Depr_Rate%)) + Σ Net_Adj</code>", formula_style)
        ],
        [
            Paragraph("Step 6: Building Assessed Value", table_cell_bold),
            Paragraph("<code>AV = AMV × Assessment Level (Schedule based on AMV bracket)</code>", formula_style)
        ]
    ]
    t_bldg = Table(bldg_formulas, colWidths=[200, 304])
    t_bldg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_bldg)
    story.append(Spacer(1, 12))

    # 3.4 MACHINERY & EQUIPMENT
    story.append(Paragraph("3.4. Machinery & Equipment Appraisal Engine", h2_style))
    story.append(Paragraph(
        "Source File: <code>src/pages/Formstabs/useMachineryData.ts</code> and <code>MachineryUtils.ts</code>",
        ParagraphStyle('SrcRef4', fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED_TEXT, spaceAfter=4)
    ))
    story.append(Paragraph(
        "Under Section 216 of RA 7160, machinery encompasses machines, equipment, mechanical contrivances, instruments, and apparatus directly used in manufacturing, commerce, and agricultural processing.",
        body_style
    ))

    mach_formulas = [
        [
            Paragraph("<b>Total Acquisition Cost (TAC)</b>", table_cell_bold),
            Paragraph("<code>TAC = Original Cost + Freight + Insurance + Installation + Others</code>", formula_style)
        ],
        [
            Paragraph("<b>Remaining Useful Life</b>", table_cell_bold),
            Paragraph("<code>Remaining Life = max(0, Estimated Life - Years in Operation)</code>", formula_style)
        ],
        [
            Paragraph("<b>Depreciation Amount</b>", table_cell_bold),
            Paragraph("<code>Depreciation = TAC × (Depreciation% / 100)</code><br/><i>(Maximum cumulative depreciation allowed by law is typically 80%)</i>", formula_style)
        ],
        [
            Paragraph("<b>Adjusted Market Value (AMV)</b>", table_cell_bold),
            Paragraph("<code>AMV = TAC - Depreciation = TAC × (1 - (Depreciation% / 100))</code>", formula_style)
        ],
        [
            Paragraph("<b>Assessed Value (AV)</b>", table_cell_bold),
            Paragraph("<code>AV = AMV × Assessment Level (Machinery standard: 80% Commercial/Industrial)</code>", formula_style)
        ]
    ]
    t_mach = Table(mach_formulas, colWidths=[180, 324])
    t_mach.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_mach)
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 4: REAL PROPERTY TAX (RPT) BILLING & COLLECTION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("4. MUNICIPAL TAX REVENUE & BILLING COMPUTATION", h1_style))
    story.append(Paragraph(
        "Once the Assessed Value ($AV$) has been finalized through the Taxmap appraisal engine, the Treasury Department and MISO compute the official annual tax due as recorded on <b>Accountable Form No. 56</b>.",
        body_style
    ))

    tax_rate_table = [
        [
            Paragraph("Tax Component", table_header_style),
            Paragraph("Statutory Rate (Province of Bukidnon)", table_header_style),
            Paragraph("Legal Beneficiary & Allocation", table_header_style)
        ],
        [
            Paragraph("<b>Basic Real Property Tax (Basic RPT)</b>", table_cell_bold),
            Paragraph("<b>1.0%</b> of Assessed Value (Provincial / Municipal Rate)", table_cell_style),
            Paragraph("Divided between Province (35%), Municipality (40%), and Barangay of origin (25%).", table_cell_style)
        ],
        [
            Paragraph("<b>Special Education Fund (SEF)</b>", table_cell_bold),
            Paragraph("<b>1.0%</b> of Assessed Value (Fixed by RA 7160)", table_cell_style),
            Paragraph("Dedicated to the Local School Board for public school construction, teacher training, and books.", table_cell_style)
        ],
        [
            Paragraph("<b>Total Standard Annual Tax Due</b>", table_cell_bold),
            Paragraph("<b>2.0%</b> of Assessed Value (Basic + SEF)", table_cell_style),
            Paragraph("Combined annual tax liability before prompt discounts or delinquent surcharges.", table_cell_style)
        ],
        [
            Paragraph("<b>Idle Land Tax (Optional)</b>", table_cell_bold),
            Paragraph("Up to <b>5.0%</b> of Assessed Value", table_cell_style),
            Paragraph("Imposed on uncultivated agricultural or unimproved urban land lots.", table_cell_style)
        ]
    ]
    t_tr = Table(tax_rate_table, colWidths=[150, 160, 194])
    t_tr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tr)
    story.append(Spacer(1, 10))

    story.append(Paragraph("4.1. Discounts, Installments & Delinquency Surcharges", h2_style))
    story.append(Paragraph(
        "• <b>Quarterly Installment Schedule:</b> Taxpayers may settle annual taxes in four equal installments:<br/>"
        "  - 1st Quarter: On or before March 31<br/>"
        "  - 2nd Quarter: On or before June 30<br/>"
        "  - 3rd Quarter: On or before September 30<br/>"
        "  - 4th Quarter: On or before December 31<br/>"
        "• <b>Prompt Payment Discount:</b> A discount of up to <b>10% to 20%</b> is granted to taxpayers who settle their annual tax liability in full on or before January 31 of the current fiscal year.<br/>"
        "• <b>Delinquency Interest Penalty:</b> Failure to pay on time incurs a surcharge of <b>2% per month</b> on the unpaid amount, up to a maximum cap of <b>72%</b> (equivalent to 36 months / 3 years of delinquency).",
        bullet_style
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("4.2. Complete End-to-End Tax Calculation Example", h2_style))
    example_box = [
        [
            Paragraph("<b>COMPREHENSIVE WORKED PROPERTY BILLING:</b><br/>"
                      "• <b>Property Type:</b> 2-Storey Commercial Concrete Building (Barangay Tankulan, Manolo Fortich).<br/>"
                      "• <b>Footprint Area:</b> 150 sq.m per floor (Total 300 sq.m across 2 storeys).<br/>"
                      "• <b>Building Base Unit Rate:</b> ₱8,500.00 / sq.m.<br/>"
                      "• <code>BMV = 150 × 2 × 8,500 = ₱2,550,000.00</code><br/>"
                      "• <b>Building Age & Depreciation:</b> 10 years @ 1.8% annual depr = 18% depreciation.<br/>"
                      "• <code>Depreciated BMV = ₱2,550,000.00 × (1 - 0.18) = ₱2,091,000.00</code><br/>"
                      "• <b>Subcomponent Improvements:</b> Reinforced Mezzanine + Fire Alarm System = ₱180,000.00.<br/>"
                      "• <code>Adjusted Market Value (AMV) = ₱2,091,000.00 + ₱180,000.00 = ₱2,271,000.00</code><br/>"
                      "• <b>Commercial Assessment Level:</b> 50% for Commercial Building > ₱2,000,000.<br/>"
                      "• <code>Assessed Value (AV) = ₱2,271,000.00 × 50% = ₱1,135,500.00</code><br/>"
                      "• <b>Basic RPT (1%):</b> <code>₱1,135,500.00 × 0.01 = ₱11,355.00</code><br/>"
                      "• <b>Special Education Fund (1%):</b> <code>₱1,135,500.00 × 0.01 = ₱11,355.00</code><br/>"
                      "• <b>Total Annual Real Property Tax Due:</b> <b>₱22,710.00</b> (or ₱5,677.50 per quarter)", callout_style)
        ]
    ]
    t_ex = Table(example_box, colWidths=[504])
    t_ex.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEFCE8")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#EAB308")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_ex)
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 5: CLOUD SYNCHRONIZATION & RELATIONAL DATA MODEL
    # =========================================================================
    story.append(Paragraph("5. RELATIONAL DATA MODEL & CLOUD SYNC ENGINE", h1_style))
    story.append(Paragraph(
        "Source File: <code>src/services/supabaseApi.ts</code>",
        ParagraphStyle('SrcRef5', fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED_TEXT, spaceAfter=4)
    ))
    story.append(Paragraph(
        "When an assessor taps 'Upload to Cloud' on an offline form with status <code>unploaded</code>, the application initiates an atomic transaction over Supabase Postgres RPCs to preserve relational integrity across tables:",
        body_style
    ))

    rpc_data = [
        [
            Paragraph("RPC Function Call", table_header_style),
            Paragraph("Input Payload", table_header_style),
            Paragraph("Relational Action & Generated Primary Key", table_header_style)
        ],
        [
            Paragraph("<code>insert_form_and_return_id</code>", table_cell_bold),
            Paragraph("<code>declarant, kind_id, class_id, area, district_id, actual_used_id, subclass_id</code>", table_cell_style),
            Paragraph("Inserts record into master <code>forms</code> table. Returns newly minted UUID <code>form_id</code>.", table_cell_style)
        ],
        [
            Paragraph("<code>insert_photo_and_return_id</code>", table_cell_bold),
            Paragraph("<code>photo_path, longitude, latitude, date_taken</code>", table_cell_style),
            Paragraph("Inserts record into <code>photo_tags</code> table. Returns newly minted UUID <code>tag_id</code>.", table_cell_style)
        ],
        [
            Paragraph("<code>insert_value_info_and_return_id</code>", table_cell_bold),
            Paragraph("<code>p_form_id, p_tag_id</code>", table_cell_style),
            Paragraph("Creates bridge entity linking the assessment form to its geotagged photo. Returns <code>value_info_id</code>.", table_cell_style)
        ],
        [
            Paragraph("<code>insert_general_description</code>", table_cell_bold),
            Paragraph("<code>building_code, storey, bld_age, date_constructed, depreciation_rate</code>", table_cell_style),
            Paragraph("Populates building structural properties foreign-keyed to <code>value_info_id</code>.", table_cell_style)
        ],
        [
            Paragraph("<code>insert_building_adjustments</code>", table_cell_bold),
            Paragraph("<code>building_subcom_id, completion_percent, depreciation, area</code>", table_cell_style),
            Paragraph("Iteratively inserts line-item subcomponents foreign-keyed to <code>value_info_id</code>.", table_cell_style)
        ],
        [
            Paragraph("<code>insert_machine_data</code>", table_cell_bold),
            Paragraph("<code>equipment, serial_no, original_cost, freight, depreciation</code>", table_cell_style),
            Paragraph("Populates machinery line items foreign-keyed to <code>value_info_id</code>. Returns <code>machinedata_id</code>.", table_cell_style)
        ]
    ]
    t_rpc = Table(rpc_data, colWidths=[140, 174, 190])
    t_rpc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_rpc)
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 6: DESKTOP ADMIN & AUDIT SUITE
    # =========================================================================
    story.append(Paragraph("6. DESKTOP ADMIN & REVENUE AUDIT (TAXMAP-ADMIN)", h1_style))
    story.append(Paragraph(
        "Built with Electron and React, the <b>Taxmap-Admin</b> application provides the Municipal Assessor and Treasury leadership with oversight capabilities:",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Executive Dashboard (Dashboard.tsx):</b> Visualizes total taxable properties assessed, total assessed valuation per barangay, and revenue collection velocity using responsive Chart.js analytics.<br/>"
        "• <b>Personnel & Role Management (People.tsx & AdminRegistration.tsx):</b> Manages credentialed field assessors, tax mapping staff, and system administrators with hashed credential authentication (Bcrypt.js).<br/>"
        "• <b>Form Verification & Approval (Forms.tsx):</b> Assessor staff inspect field surveys, verify photographic evidence against lot declarations, and approve entries for official tax declaration issuance.<br/>"
        "• <b>Audit Trail & System Logs (Logs.tsx):</b> Immutable logging of all user activities, form edits, deletions, and upload events to comply with Commission on Audit (COA) municipal auditing standards.",
        bullet_style
    ))
    story.append(Spacer(1, 15))

    # =========================================================================
    # SECTION 7: SUMMARY & CONCLUSION
    # =========================================================================
    story.append(Paragraph("7. CONCLUSION & IMPACT", h1_style))
    story.append(Paragraph(
        "The Taxmap ecosystem transitions the Local Government Unit of Manolo Fortich from obsolete paper assessment books and disconnected spreadsheets into an automated, spatially indexed, and audit-compliant GIS real property tax environment. By enabling offline field surveys with native camera and GPS integration, eliminating mathematical calculation errors through automated SFMV engines, and synchronizing data reliably to cloud infrastructure, Taxmap significantly accelerates municipal revenue collection, minimizes tax leakage, and elevates citizen trust in local government administration.",
        body_style
    ))
    story.append(Spacer(1, 20))

    # Sign-off block
    signoff_data = [
        [
            Paragraph("<b>Prepared By:</b>", table_cell_bold),
            Paragraph("<b>Reviewed & Endorsed By:</b>", table_cell_bold)
        ],
        [
            Paragraph("<br/><br/><b>JETHRO BALAGA</b><br/>OJT Technical Intern / Developer<br/>Taxmap Project Team", table_cell_style),
            Paragraph("<br/><br/><b>MUNICIPAL INFORMATION SERVICES OFFICE (MISO)</b><br/>& Municipal Assessor's Office<br/>LGU Manolo Fortich, Bukidnon", table_cell_style)
        ]
    ]
    t_sign = Table(signoff_data, colWidths=[250, 254])
    t_sign.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_sign)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {output_path}")

if __name__ == "__main__":
    out = "Taxmap_System_Comprehensive_Documentation.pdf"
    if len(sys.argv) > 1:
        out = sys.argv[1]
    create_taxmap_pdf(out)
