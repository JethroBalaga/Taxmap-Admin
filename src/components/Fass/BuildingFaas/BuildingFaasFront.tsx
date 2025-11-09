import React from "react";

interface BuildingFaasFrontProps {
  fields: Record<string, string>;
  materials: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  onMaterialChange: (row: number, col: number, value: string) => void;
}

const ROW_COUNT = 16;

const BuildingFaasFront: React.FC<BuildingFaasFrontProps> = ({
  fields,
  materials,
  onFieldChange,
  onMaterialChange
}) => {
  return (
    <div className="sheet">
      {/* Header inside printable sheet (centered) */}
      <div className="form-title">
        <div>REAL PROPERTY FIELD APPRAISAL AND ASSESSMENT SHEET - BUILDING &amp; OTHER STRUCTURES</div>
      </div>

      {/* Transaction code line (top right) */}
      <div className="transaction-row">
        <div className="trans-label">Transaction Code :</div>
        <div className="trans-input">
          <input
            value={fields.transactionCode || ""}
            onChange={(e) => onFieldChange("transactionCode", e.target.value)}
          />
        </div>
      </div>

      {/* TOP BOX: ARP, PIN, Owner, Tel, Address, TIN, Admin/Beneficial User */}
      <div className="box top-box">
        <div className="row">
          <div className="cell label">ARP No.:</div>
          <div className="cell input right-aligned">
            <input value={fields.arpNo || ""} onChange={(e) => onFieldChange("arpNo", e.target.value)} />
          </div>

          <div className="cell label narrow">PIN:</div>
          <div className="cell input right-aligned narrow">
            <input value={fields.pin || ""} onChange={(e) => onFieldChange("pin", e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="cell label">Owner:</div>
          <div className="cell input right-aligned wide">
            <input value={fields.owner || ""} onChange={(e) => onFieldChange("owner", e.target.value)} />
          </div>

          <div className="cell label narrow">Tel. No.:</div>
          <div className="cell input right-aligned narrow">
            <input value={fields.tel || ""} onChange={(e) => onFieldChange("tel", e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="cell label">Address :</div>
          <div className="cell input right-aligned wide">
            <input value={fields.address || ""} onChange={(e) => onFieldChange("address", e.target.value)} />
          </div>

          <div className="cell label narrow">TIN:</div>
          <div className="cell input right-aligned narrow">
            <input value={fields.tin || ""} onChange={(e) => onFieldChange("tin", e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="cell label admin-label">Beneficial User:</div>
          <div className="cell input right-aligned wide">
            <input value={fields.adminName || ""} onChange={(e) => onFieldChange("adminName", e.target.value)} />
          </div>

          <div className="cell label narrow">Tel. No.:</div>
          <div className="cell input right-aligned narrow">
            <input value={fields.adminTel || ""} onChange={(e) => onFieldChange("adminTel", e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="cell label">Address :</div>
          <div className="cell input right-aligned wide">
            <input value={fields.adminAddress || ""} onChange={(e) => onFieldChange("adminAddress", e.target.value)} />
          </div>

          <div className="cell label narrow">TIN:</div>
          <div className="cell input right-aligned narrow">
            <input value={fields.adminTin || ""} onChange={(e) => onFieldChange("adminTin", e.target.value)} />
          </div>
        </div>
      </div>

      {/* BUILDING LOCATION / LAND REFERENCE */}
      <div className="box two-col-box">
        <div className="col">
          <div className="section-title">BUILDING LOCATION</div>

          <div className="row small">
            <div className="cell label">No./Street :</div>
            <div className="cell input right-aligned"><input value={fields.street || ""} onChange={e => onFieldChange("street", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label">Brgy./District:</div>
            <div className="cell input right-aligned"><input value={fields.brgy || ""} onChange={e => onFieldChange("brgy", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label">Purok:</div>
            <div className="cell input right-aligned narrow"><input value={fields.purok || ""} onChange={e => onFieldChange("purok", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label">Municipality:</div>
            <div className="cell input right-aligned narrow"><input value={fields.municipality || ""} onChange={e => onFieldChange("municipality", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label">Province :</div>
            <div className="cell input right-aligned narrow"><input value={fields.province || ""} onChange={e => onFieldChange("province", e.target.value)} /></div>
          </div>
        </div>

        <div className="col">
          <div className="section-title">LAND REFERENCE</div>

          <div className="row small">
            <div className="cell label">Owner:</div>
            <div className="cell input right-aligned"><input value={fields.landOwner || ""} onChange={e => onFieldChange("landOwner", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label">Administrator:</div>
            <div className="cell input right-aligned"><input value={fields.landAdministrator || ""} onChange={e => onFieldChange("landAdministrator", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label narrow">Title No. :</div>
            <div className="cell input right-aligned narrow"><input value={fields.titleNo || ""} onChange={e => onFieldChange("titleNo", e.target.value)} /></div>

            <div className="cell label narrow">Lot No. :</div>
            <div className="cell input right-aligned short"><input value={fields.lotNo || ""} onChange={e => onFieldChange("lotNo", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label narrow">TD / ARP No. :</div>
            <div className="cell input right-aligned narrow"><input value={fields.tdArp || ""} onChange={e => onFieldChange("tdArp", e.target.value)} /></div>

            <div className="cell label narrow">Survey No. :</div>
            <div className="cell input right-aligned short"><input value={fields.surveyNo || ""} onChange={e => onFieldChange("surveyNo", e.target.value)} /></div>
          </div>

          <div className="row small">
            <div className="cell label narrow">Area:</div>
            <div className="cell input right-aligned narrow"><input value={fields.area || ""} onChange={e => onFieldChange("area", e.target.value)} /></div>

            <div className="cell label narrow">Block No. :</div>
            <div className="cell input right-aligned short"><input value={fields.blockNo || ""} onChange={e => onFieldChange("blockNo", e.target.value)} /></div>
          </div>
        </div>
      </div>

      {/* GENERAL DESCRIPTION */}
      <div className="box gen-box">
        <div className="section-title">GENERAL DESCRIPTION</div>

        <div className="row small">
          <div className="cell label narrow">Kind of Bldg.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.kind || ""} onChange={e => onFieldChange("kind", e.target.value)} /></div>

          <div className="cell label special-indicator-label">Bldg. Special Ind.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.special || ""} onChange={e => onFieldChange("special", e.target.value)} /></div>

          <div className="cell label narrow">Effective Age:</div>
          <div className="cell input right-aligned narrow"><input value={fields.effectiveAge || ""} onChange={e => onFieldChange("effectiveAge", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label narrow">Structural Type:</div>
          <div className="cell input right-aligned narrow"><input value={fields.structuralType || ""} onChange={e => onFieldChange("structuralType", e.target.value)} /></div>

          <div className="cell label narrow">No. of Storeys:</div>
          <div className="cell input right-aligned narrower"><input value={fields.storeys || ""} onChange={e => onFieldChange("storeys", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label narrow">Bldg. Permit No.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.permitNo || ""} onChange={e => onFieldChange("permitNo", e.target.value)} /></div>

          <div className="cell label narrow">Date:</div>
          <div className="cell input right-aligned short"><input type="date" value={fields.permitDate || ""} onChange={e => onFieldChange("permitDate", e.target.value)} /></div>

          <div className="cell label narrow">Area of 1st flr.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.area1 || ""} onChange={e => onFieldChange("area1", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label cct-label">CCT No.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.cct || ""} onChange={e => onFieldChange("cct", e.target.value)} /></div>

          <div className="cell label narrow">Area of 2nd flr.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.area2 || ""} onChange={e => onFieldChange("area2", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label cert-label">Cert. Completion:</div>
          <div className="cell input right-aligned narrow"><input value={fields.certCompletion || ""} onChange={e => onFieldChange("certCompletion", e.target.value)} /></div>

          <div className="cell label narrow">Area of 3rd flr.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.area3 || ""} onChange={e => onFieldChange("area3", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label cert-label">Cert. Occupancy:</div>
          <div className="cell input right-aligned narrow"><input value={fields.certOccupancy || ""} onChange={e => onFieldChange("certOccupancy", e.target.value)} /></div>

          <div className="cell label narrow">Area of 4th flr.:</div>
          <div className="cell input right-aligned narrow"><input value={fields.area4 || ""} onChange={e => onFieldChange("area4", e.target.value)} /></div>
        </div>

        <div className="row small">
          <div className="cell label narrow">Date Completed:</div>
          <div className="cell input right-aligned short"><input type="date" value={fields.dateCompleted || ""} onChange={e => onFieldChange("dateCompleted", e.target.value)} /></div>

          <div className="cell label narrow">Date Occupied:</div>
          <div className="cell input right-aligned short"><input type="date" value={fields.dateOccupied || ""} onChange={e => onFieldChange("dateOccupied", e.target.value)} /></div>

          <div className="cell label">Total Floor Area</div>
          <div className="cell input right-aligned wide"><input value={fields.totalFloorArea || ""} onChange={e => onFieldChange("totalFloorArea", e.target.value)} /></div>
        </div>
      </div>

      {/* FLOOR PLAN */}
      <div className="box floor-box">
        <div className="section-title">FLOOR PLAN</div>
        <div className="floor-area-one" />
      </div>

      {/* STRUCTURAL MATERIALS */}
      <div className="box materials-box">
        <div className="section-title">STRUCTURAL MATERIALS (Checklist)</div>
        <div className="small-muted">ROOF / FLOORING (1st-4th) / Walls &amp; Partitions (1st-4th)</div>

        <div className="materials-table">
          <div className="materials-row header">
            <div className="m cell roof-col">ROOF</div>
            <div className="m cell flooring-col">FLOORING</div>
            <div className="m cell floor-col">1st</div>
            <div className="m cell floor-col">2nd</div>
            <div className="m cell floor-col">3rd</div>
            <div className="m cell floor-col">4th</div>
            <div className="m cell walls-col">Walls & Part</div>
            <div className="m cell floor-col">1st</div>
            <div className="m cell floor-col">2nd</div>
            <div className="m cell floor-col">3rd</div>
            <div className="m cell floor-col">4th</div>
          </div>

          {Array.from({ length: ROW_COUNT }, (_, i) => {
            const r = i + 1;
            return (
              <div className="materials-row" key={r}>
                <div className="m cell roof-col"><input value={materials[`r${r}_c1`] || ""} onChange={e => onMaterialChange(r, 1, e.target.value)} /></div>
                <div className="m cell flooring-col"><input value={materials[`r${r}_c2`] || ""} onChange={e => onMaterialChange(r, 2, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c3`] || ""} onChange={e => onMaterialChange(r, 3, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c4`] || ""} onChange={e => onMaterialChange(r, 4, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c5`] || ""} onChange={e => onMaterialChange(r, 5, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c6`] || ""} onChange={e => onMaterialChange(r, 6, e.target.value)} /></div>
                <div className="m cell walls-col"><input value={materials[`r${r}_c7`] || ""} onChange={e => onMaterialChange(r, 7, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c8`] || ""} onChange={e => onMaterialChange(r, 8, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c9`] || ""} onChange={e => onMaterialChange(r, 9, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c10`] || ""} onChange={e => onMaterialChange(r, 10, e.target.value)} /></div>
                <div className="m cell floor-col"><input value={materials[`r${r}_c11`] || ""} onChange={e => onMaterialChange(r, 11, e.target.value)} /></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NOTES */}
      <div className="box notes-box">
        <div className="section-title">Notes / Remarks</div>
        <textarea value={fields.notes || ""} onChange={e => onFieldChange("notes", e.target.value)} />
      </div>
    </div>
  );
};

export default BuildingFaasFront;