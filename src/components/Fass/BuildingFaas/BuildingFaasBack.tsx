import React, { useState, useEffect } from "react";
import { supabase } from '../../../utils/supaBaseClient';

interface BuildingFaasBackProps {
  formData?: any;
  generalData?: any[];
  assessmentSummary?: any[];
  buildingAdjustments?: any[];
  isTaxable?: boolean;
  isExempt?: boolean;
  currentQuarter?: string;
  currentYear?: string;
  onTaxableChange?: (taxable: boolean) => void;
  onExemptChange?: (exempt: boolean) => void;
}

interface BuildingComponent {
  building_com_id: string;
  description: string;
  created_at?: string;
}

interface BuildingSubcomponent {
  building_subcom_id: string;
  description: string;
  rate: number;
  building_com_id: string;
  created_at?: string;
  percent: boolean;
}

const BuildingFaasBack: React.FC<BuildingFaasBackProps> = ({
  formData,
  generalData = [],
  assessmentSummary = [],
  buildingAdjustments = [],
  isTaxable = true,
  isExempt = false,
  currentQuarter = "1",
  currentYear = "",
  onTaxableChange,
  onExemptChange
}) => {
  const [buildingComponents, setBuildingComponents] = useState<BuildingComponent[]>([]);
  const [buildingSubcomponents, setBuildingSubcomponents] = useState<BuildingSubcomponent[]>([]);
  
  // Back page states - ADD THESE BACK!
  const [appraisal, setAppraisal] = useState<Record<string, string>>({});
  const [addItems, setAddItems] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<Record<string, string>>({});

  // Back page handlers - ADD THESE BACK!
  const setApp = (r: number, c: number, v: string) =>
    setAppraisal((p) => ({ ...p, [`r${r}_c${c}`]: v }));
  const setItem = (r: number, c: number, v: string) =>
    setAddItems((p) => ({ ...p, [`r${r}_c${c}`]: v }));
  const setAssess = (r: number, c: number, v: string) =>
    setAssessment((p) => ({ ...p, [`r${r}_c${c}`]: v }));

  // Fetch building components and subcomponents
  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        // Fetch building components
        const { data: components, error: componentsError } = await supabase
          .from('building_componenttbl')
          .select('*');

        if (componentsError) {
          console.error('Error fetching building components:', componentsError);
          return;
        }

        // Fetch building subcomponents
        const { data: subcomponents, error: subcomponentsError } = await supabase
          .from('building_subcomponenttbl')
          .select('*');

        if (subcomponentsError) {
          console.error('Error fetching building subcomponents:', subcomponentsError);
          return;
        }

        setBuildingComponents(components || []);
        setBuildingSubcomponents(subcomponents || []);
      } catch (error) {
        console.error('Failed to fetch building data:', error);
      }
    };

    fetchBuildingData();
  }, []);

  // Get component description by ID
  const getComponentDescription = (componentId: string): string => {
    const component = buildingComponents.find(comp => comp.building_com_id === componentId);
    return component?.description || 'Additional Component';
  };

  // Get subcomponent data by ID
  const getSubcomponentData = (subcomponentId: string) => {
    const subcomponent = buildingSubcomponents.find(sub => sub.building_subcom_id === subcomponentId);
    return {
      description: subcomponent?.description || 'Adjustment',
      rate: subcomponent?.rate || 0,
      isPercent: subcomponent?.percent || false
    };
  };

  // Helper function to get floor name
  const getFloorName = (floorNumber: number): string => {
    const floorNames: { [key: number]: string } = {
      1: '1st Floor',
      2: '2nd Floor',
      3: '3rd Floor',
      4: '4th Floor'
    };
    return floorNames[floorNumber] || `${floorNumber}th Floor`;
  };

  // Create combined data for PROPERTY APPRAISAL - DUPLICATED BY STOREY
  const getCombinedAppraisalData = () => {
    const combinedData = [];

    // Use assessmentSummary as the primary source for values
    if (assessmentSummary && assessmentSummary.length > 0) {
      assessmentSummary.forEach((assessmentItem, index) => {
        // Try to find matching general data by index or use first available
        const generalItem = generalData[index] || generalData[0] || {};
        
        const totalArea = parseFloat(assessmentItem.area) || parseFloat(generalItem.area) || 0;
        const totalBaseValue = parseFloat(assessmentItem.base_market_value) || parseFloat(generalItem.base_market_value) || 0;
        const totalAdjustedValue = parseFloat(assessmentItem.final_adjusted_market_value) || parseFloat(generalItem.final_adjusted_market_value) || 0;
        const depreciationRate = parseFloat(generalItem.depreciation_rate) || 0;
        
        // Get number of storeys from general data
        const storeyCount = parseInt(generalItem.storey) || 1;
        
        // Calculate per storey values
        const areaPerStorey = totalArea / storeyCount;
        const baseValuePerStorey = totalBaseValue / storeyCount;
        const adjustedValuePerStorey = totalAdjustedValue / storeyCount;
        const depreciationCostPerStorey = (baseValuePerStorey * (depreciationRate / 100));

        // Create separate entries for each storey
        for (let storey = 1; storey <= storeyCount; storey++) {
          combinedData.push({
            description: `${generalItem.building_code || 'Building Structure'} - ${getFloorName(storey)}`,
            type: 'Structure',
            area: areaPerStorey,
            unitValue: 0,
            completionPercent: generalItem.construction_percent || '100',
            baseValue: baseValuePerStorey,
            depreciationRate: depreciationRate,
            depreciationCost: depreciationCostPerStorey,
            marketValue: adjustedValuePerStorey,
            storeyNumber: storey,
            totalStoreys: storeyCount
          });
        }
      });
    } 
    // If no assessment summary but we have general data, use general data
    else if (generalData && generalData.length > 0) {
      generalData.forEach((generalItem, index) => {
        const totalArea = parseFloat(generalItem.area) || 0;
        const totalBaseValue = parseFloat(generalItem.base_market_value) || 0;
        const totalAdjustedValue = parseFloat(generalItem.final_adjusted_market_value) || 0;
        const depreciationRate = parseFloat(generalItem.depreciation_rate) || 0;
        
        // Get number of storeys from general data
        const storeyCount = parseInt(generalItem.storey) || 1;
        
        // Calculate per storey values
        const areaPerStorey = totalArea / storeyCount;
        const baseValuePerStorey = totalBaseValue / storeyCount;
        const adjustedValuePerStorey = totalAdjustedValue / storeyCount;
        const depreciationCostPerStorey = (baseValuePerStorey * (depreciationRate / 100));

        // Create separate entries for each storey
        for (let storey = 1; storey <= storeyCount; storey++) {
          combinedData.push({
            description: `${generalItem.building_code || 'Building Structure'} - ${getFloorName(storey)}`,
            type: 'Structure',
            area: areaPerStorey,
            unitValue: 0,
            completionPercent: generalItem.construction_percent || '100',
            baseValue: baseValuePerStorey,
            depreciationRate: depreciationRate,
            depreciationCost: depreciationCostPerStorey,
            marketValue: adjustedValuePerStorey,
            storeyNumber: storey,
            totalStoreys: storeyCount
          });
        }
      });
    }
    // If no data at all, create a default entry
    else {
      combinedData.push({
        description: 'Building Structure - 1st Floor',
        type: 'Structure',
        area: 0,
        unitValue: 0,
        completionPercent: '100',
        baseValue: 0,
        depreciationRate: 0,
        depreciationCost: 0,
        marketValue: 0,
        storeyNumber: 1,
        totalStoreys: 1
      });
    }

    return combinedData;
  };

  // Calculate values from combined data
  const calculateBuildingValues = () => {
    const combinedAppraisalData = getCombinedAppraisalData();
    
    let totalBaseValue = 0;
    let totalAdjustedValue = 0;
    let totalArea = 0;
    let totalDepreciation = 0;

    // Calculate from combined appraisal data
    combinedAppraisalData.forEach(item => {
      totalArea += item.area;
      totalBaseValue += item.baseValue;
      totalAdjustedValue += item.marketValue;
      totalDepreciation += item.depreciationCost;
    });

    // Calculate from building adjustments (additional items)
    buildingAdjustments.forEach(adjustment => {
      const area = parseFloat(adjustment.area) || 0;
      const baseValue = parseFloat(adjustment.base_value) || 0;
      const adjustedValue = parseFloat(adjustment.adjusted_value) || 0;
      const depreciationRate = parseFloat(adjustment.depreciation_rate) || 0;
      const depreciationCost = baseValue * (depreciationRate / 100);
      
      totalArea += area;
      totalBaseValue += baseValue;
      totalAdjustedValue += adjustedValue;
      totalDepreciation += depreciationCost;
    });

    const result = {
      totalBaseValue,
      totalAdjustedValue,
      totalArea,
      totalDepreciation,
      totalMarketValue: totalAdjustedValue > 0 ? totalAdjustedValue : totalBaseValue
    };

    return result;
  };

  const buildingValues = calculateBuildingValues();
  const combinedAppraisalData = getCombinedAppraisalData();
  
  const formatCurrency = (value: number) => 
    `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ROW_APPRAISAL = 6;
  const ROW_ITEMS = 10;
  const ROW_ASSESSMENT = 4;

  // Calculate subtotals for main building structures from COMBINED data
  const mainBuildingArea = combinedAppraisalData.reduce((sum, item) => sum + item.area, 0);
  const mainBuildingBaseValue = combinedAppraisalData.reduce((sum, item) => sum + item.baseValue, 0);
  const mainBuildingMarketValue = combinedAppraisalData.reduce((sum, item) => sum + item.marketValue, 0);
  const mainBuildingDepreciation = combinedAppraisalData.reduce((sum, item) => sum + item.depreciationCost, 0);

  // Calculate subtotals for additional items (building adjustments)
  const additionalItemsArea = buildingAdjustments.reduce((sum, adj) => sum + (parseFloat(adj.area) || 0), 0);
  const additionalItemsBaseValue = buildingAdjustments.reduce((sum, adj) => sum + (parseFloat(adj.base_value) || 0), 0);
  const additionalItemsMarketValue = buildingAdjustments.reduce((sum, adj) => sum + (parseFloat(adj.adjusted_value) || 0), 0);
  const additionalItemsDepreciation = buildingAdjustments.reduce((sum, adj) => {
    const baseValue = parseFloat(adj.base_value) || 0;
    const depreciationRate = parseFloat(adj.depreciation_rate) || 0;
    return sum + (baseValue * (depreciationRate / 100));
  }, 0);

  // Calculate totals
  const totalArea = mainBuildingArea + additionalItemsArea;
  const totalBaseValue = mainBuildingBaseValue + additionalItemsBaseValue;
  const totalMarketValue = mainBuildingMarketValue + additionalItemsMarketValue;
  const totalDepreciation = mainBuildingDepreciation + additionalItemsDepreciation;

  return (
    <div className="back-page page-break">
      <div className="sheet back-sheet">
        {/* PROPERTY APPRAISAL - DUPLICATED BY STOREY */}
        <div className="section-header">PROPERTY APPRAISAL</div>

        <table className="table appraisal-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th>Area (sq.m.)</th>
              <th>Unit Value</th>
              <th>% of BUCC (SMV)</th>
              <th>Base Market Value (₱)</th>
              <th>% Depn.</th>
              <th>Depreciation Cost (₱)</th>
              <th>Market Value (₱)</th>
            </tr>
          </thead>
          <tbody>
            {/* Combined Appraisal Data Rows - Duplicated by Storey */}
            {combinedAppraisalData.map((item, index) => (
              <tr key={`combined-${index}`}>
                <td>
                  <input
                    value={appraisal[`combined_desc_${index}`] || item.description}
                    onChange={(e) => setApp(index, 0, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_type_${index}`] || item.type}
                    onChange={(e) => setApp(index, 1, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_area_${index}`] || item.area.toFixed(2)}
                    onChange={(e) => setApp(index, 2, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_unit_${index}`] || item.unitValue.toFixed(2)}
                    onChange={(e) => setApp(index, 3, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_bucc_${index}`] || item.completionPercent}
                    onChange={(e) => setApp(index, 4, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_base_${index}`] || formatCurrency(item.baseValue)}
                    onChange={(e) => setApp(index, 5, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_depn_${index}`] || item.depreciationRate.toFixed(2)}
                    onChange={(e) => setApp(index, 6, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_depn_cost_${index}`] || formatCurrency(item.depreciationCost)}
                    onChange={(e) => setApp(index, 7, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={appraisal[`combined_market_${index}`] || formatCurrency(item.marketValue)}
                    onChange={(e) => setApp(index, 8, e.target.value)}
                  />
                </td>
              </tr>
            ))}

            {/* Empty rows for main appraisal */}
            {[...Array(Math.max(0, ROW_APPRAISAL - combinedAppraisalData.length))].map((_, index) => {
              const emptyIndex = index + combinedAppraisalData.length;
              return (
                <tr key={`empty-${emptyIndex}`}>
                  {[...Array(9)].map((_, c) => (
                    <td key={c}>
                      <input
                        value={appraisal[`empty${emptyIndex}_c${c}`] || ""}
                        onChange={(e) => setApp(emptyIndex, c, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Subtotal for main building structures */}
            <tr className="subtotal-row">
              <td colSpan={2} style={{ textAlign: 'left', fontWeight: 'bold' }}>Sub-total</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {mainBuildingArea.toFixed(2)}
              </td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(mainBuildingBaseValue)}
              </td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(mainBuildingDepreciation)}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(mainBuildingMarketValue)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ADDITIONAL ITEMS - Building Adjustments with Components and Subcomponents */}
        <div className="section-header">ADDITIONAL ITEMS:</div>

        <table className="table items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th>Area (sq.m.)</th>
              <th>Unit Value</th>
              <th>% Completion</th>
              <th>Base Market Value (₱)</th>
              <th>% Depn.</th>
              <th>Depreciation Cost (₱)</th>
              <th>Market Value (₱)</th>
            </tr>
          </thead>
          <tbody>
            {/* Building Adjustments Rows with Component and Subcomponent Data */}
            {buildingAdjustments.map((adjustment, index) => {
              const area = parseFloat(adjustment.area) || 0;
              const baseValue = parseFloat(adjustment.base_value) || 0;
              const adjustedValue = parseFloat(adjustment.adjusted_value) || 0;
              const depreciationRate = parseFloat(adjustment.depreciation_rate) || 0;
              const depreciationCost = baseValue * (depreciationRate / 100);

              // Get component and subcomponent data
              const componentDescription = getComponentDescription(adjustment.building_com_id);
              const subcomponentData = getSubcomponentData(adjustment.building_subcom_id);
              const unitValue = subcomponentData.rate;
              const unitValueDisplay = subcomponentData.isPercent ? `${unitValue}%` : unitValue.toFixed(2);

              return (
                <tr key={`adjustment-${index}`}>
                  <td>
                    <input
                      value={addItems[`adj_desc_${index}`] || componentDescription}
                      onChange={(e) => setItem(index, 0, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_type_${index}`] || subcomponentData.description}
                      onChange={(e) => setItem(index, 1, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_area_${index}`] || (area || 0).toString()}
                      onChange={(e) => setItem(index, 2, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_unit_${index}`] || unitValueDisplay}
                      onChange={(e) => setItem(index, 3, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_completion_${index}`] || adjustment.completion_percent || '100'}
                      onChange={(e) => setItem(index, 4, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_base_${index}`] || formatCurrency(baseValue || 0)}
                      onChange={(e) => setItem(index, 5, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_depn_${index}`] || depreciationRate.toString()}
                      onChange={(e) => setItem(index, 6, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_depn_cost_${index}`] || formatCurrency(depreciationCost)}
                      onChange={(e) => setItem(index, 7, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={addItems[`adj_market_${index}`] || formatCurrency(adjustedValue || 0)}
                      onChange={(e) => setItem(index, 8, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}

            {/* Empty rows for additional items */}
            {[...Array(Math.max(0, ROW_ITEMS - buildingAdjustments.length))].map((_, index) => {
              const emptyIndex = index + buildingAdjustments.length;
              return (
                <tr key={`empty-adj-${emptyIndex}`}>
                  {[...Array(9)].map((_, c) => (
                    <td key={c}>
                      <input
                        value={addItems[`empty${emptyIndex}_c${c}`] || ""}
                        onChange={(e) => setItem(emptyIndex, c, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Subtotal for additional items */}
            <tr className="subtotal-row">
              <td colSpan={2} style={{ textAlign: 'left', fontWeight: 'bold' }}>Sub-total</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {additionalItemsArea.toFixed(2)}
              </td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(additionalItemsBaseValue)}
              </td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(additionalItemsDepreciation)}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(additionalItemsMarketValue)}
              </td>
            </tr>

            {/* TOTAL - Combined total of main building and additional items */}
            <tr className="subtotal-row">
              <td colSpan={2} style={{ textAlign: 'left', fontWeight: 'bold' }}>TOTAL</td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {totalArea.toFixed(2)}
              </td>
              <td></td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalBaseValue)}
              </td>
              <td></td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalDepreciation)}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(totalMarketValue)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* PROPERTY ASSESSMENT */}
        <div className="section-header">PROPERTY ASSESSMENT</div>

        <table className="table assessment-table">
          <thead>
            <tr>
              <th>Actual Use</th>
              <th>Market Value</th>
              <th>Assessment Level (%)</th>
              <th>Assessment Value</th>
            </tr>
          </thead>
          <tbody>
            {assessmentSummary.map((item, index) => {
              const marketValue = parseFloat(item.final_adjusted_market_value) || 0;
              const assessedValue = parseFloat(item.assessed_value) || 0;

              return (
                <tr key={index}>
                  <td>
                    <input
                      value={assessment[`actual_use_${index}`] || item.actual_used_id || 'Residential'}
                      onChange={(e) => setAssess(index, 0, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={assessment[`market_value_${index}`] || formatCurrency(marketValue)}
                      onChange={(e) => setAssess(index, 1, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={assessment[`assessment_level_${index}`] || item.assessment_percent || '1%'}
                      onChange={(e) => setAssess(index, 2, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      value={assessment[`assessment_value_${index}`] || formatCurrency(assessedValue)}
                      onChange={(e) => setAssess(index, 3, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
            
            {/* If no assessment data, show one row with totals */}
            {assessmentSummary.length === 0 && (
              <tr>
                <td>
                  <input
                    value={assessment[`actual_use_0`] || formData?.kind_description || 'Building'}
                    onChange={(e) => setAssess(0, 0, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={assessment[`market_value_0`] || formatCurrency(totalMarketValue)}
                    onChange={(e) => setAssess(0, 1, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={assessment[`assessment_level_0`] || '1%'}
                    onChange={(e) => setAssess(0, 2, e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={assessment[`assessment_value_0`] || formatCurrency(totalMarketValue * 0.01)}
                    onChange={(e) => setAssess(0, 3, e.target.value)}
                  />
                </td>
              </tr>
            )}

            {/* Empty rows */}
            {[...Array(Math.max(0, ROW_ASSESSMENT - Math.max(assessmentSummary.length, 1)))].map((_, index) => {
              const emptyIndex = index + Math.max(assessmentSummary.length, 1);
              return (
                <tr key={`empty-assess-${emptyIndex}`}>
                  {[...Array(4)].map((_, c) => (
                    <td key={c}>
                      <input
                        value={assessment[`empty${emptyIndex}_c${c}`] || ""}
                        onChange={(e) => setAssess(emptyIndex, c, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="tax-row">
          <label>
            Taxable 
            <input 
              type="checkbox" 
              checked={isTaxable}
              onChange={(e) => {
                onTaxableChange?.(e.target.checked);
              }}
            />
          </label>
          <label>
            Exempt 
            <input 
              type="checkbox" 
              checked={isExempt}
              onChange={(e) => {
                onExemptChange?.(e.target.checked);
              }}
            />
          </label>
          <div className="effectivity">
            Effectivity of Assessment: {currentQuarter} Qtr. {currentYear} Yr.
          </div>
        </div>

        <div className="signature-container">
          <div>
            <div>Appraised by:</div>
            <div className="sig-line"></div>
          </div>
          <div>
            <div>Approved by:</div>
            <div className="sig-line"></div>
            <div className="prov">Acting Provincial Assessor</div>
          </div>
        </div>

        <div className="memoranda">
          MEMORANDA:<br />
          Date of Entry in the Record of Assessment ______ By: ____________
        </div>

        <div className="powered">Powered by: SPIDC</div>
      </div>
    </div>
  );
};

export default BuildingFaasBack;