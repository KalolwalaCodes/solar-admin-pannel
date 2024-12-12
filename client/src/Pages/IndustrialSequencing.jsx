import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import { useColorScheme } from "@mui/joy/styles";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/joy/AccordionSummary";
import Button from "@mui/joy/Button";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Alert } from "@mui/material";
import AlertInvertedColors from "../components/ui/Alerts";

const ReorderListInvestorData = () => {
  const { mode } = useColorScheme();
  const [investorData, setInvestorData] = useState({});
  const [investorDataClone, setInvestorDataClone] = useState({});
  const [activeTab, setActiveTab] = useState("announcements");
  const [alertMessage, setAlertMessage] = useState("");
  let x;
  const tempArr = [
    "Announcements",
    "Stock Information",
    "Corporate Governance",
    "Financial Reporting",
  ];

  // Fetching all the required data every time component renders
  useEffect(() => {
    const fetchInvestorData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        let res = await fetch(
          `/admin-panel/Investor-relation?timestamp=${new Date().getTime()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        let data = await res.json();
        setInvestorData(data);
        setInvestorDataClone(data);
      } catch (error) {
        console.error("Error fetching investor data:", error);
      }
    };
    fetchInvestorData();
  }, [activeTab]);

  // Move a parent entity up or down
  const reorderParent = (index, direction,e) => {
    e.stopPropagation();
    const updatedData = { ...investorData };
    const items = updatedData[activeTab];
    if (direction === "up" && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === "down" && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    setInvestorData(updatedData);
  };

  // Move a child entity up or down
  const reorderChild = (parentIndex, childIndex, direction,e) => {
    e.stopPropagation();
    const updatedData = { ...investorData };
    const parent = updatedData[activeTab][parentIndex];
    if (direction === "up" && childIndex > 0) {
      [parent.items[childIndex - 1], parent.items[childIndex]] = [
        parent.items[childIndex],
        parent.items[childIndex - 1],
      ];
    } else if (direction === "down" && childIndex < parent.items.length - 1) {
      [parent.items[childIndex], parent.items[childIndex + 1]] = [
        parent.items[childIndex + 1],
        parent.items[childIndex],
      ];
    }
    setInvestorData(updatedData);
  };

  // Move a details element up or down
  const reorderDetails = (parentIndex, childIndex, detailIndex, direction,e) => {
    e.stopPropagation();
    const updatedData = { ...investorData };
    const details = updatedData[activeTab][parentIndex].items[childIndex].details;

    if (direction === "up" && detailIndex > 0) {
      [details[detailIndex - 1], details[detailIndex]] = [
        details[detailIndex],
        details[detailIndex - 1],
      ];
    } else if (direction === "down" && detailIndex < details.length - 1) {
      [details[detailIndex], details[detailIndex + 1]] = [
        details[detailIndex + 1],
        details[detailIndex],
      ];
    }
    setInvestorData(updatedData);
  };

    // Submit the reordered list
    const handleSubmit = async () => {
        console.log('Data size:', JSON.stringify({ updatedData: investorData }).length);
        console.log('Data size:', JSON.stringify({ investorDataClone }).length);
        console.log('Modified investor data:', investorData,'and the x is',investorDataClone); // Ensure it's structured correctly

        try {
          const response = await fetch('/admin-panel/sequencing/investor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({updatedData:investorData}),
          });
          if (!response.ok) throw new Error('Failed to save updated order');
          console.log('Order saved successfully!');
        } catch (err) {
          console.error('Error saving order:', err.message);
        }
      };

  return (
    <div className="mt-6">
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <AlertInvertedColors msg={alertMessage} />
        {Object.keys(investorData).map((key, index) => (
          <Button
            key={index}
            variant="solid"
            sx={{
              minWidth: "300px",
              maxWidth: "100%",
              textTransform: "capitalize",
              background: `${key !== activeTab && "#C7DFF7"}`,
            }}
            onClick={() => setActiveTab(key)}
          >
            {tempArr[index]}
          </Button>
        ))}
      </Box>
      <div>
        <button onClick={handleSubmit} className="py-2 mt-5 px-5 bg-green-400">Apply Changes</button>
        <AccordionGroup
          sx={{
            minWidth: 400,
            width: "90%",
            marginTop: "40px",
            [`& .${accordionSummaryClasses.indicator}`]: {
              transition: "0.2s",
            },
            [`& [aria-expanded="true"] .${accordionSummaryClasses.indicator}`]:
              {
                transform: "rotate(45deg)",
              },
          }}
        >
          {investorData[activeTab] && investorData[activeTab].length > 0 ? (
            investorData[activeTab].map((key, parentIndex) => (
              <Accordion key={parentIndex}>
                <AccordionSummary
                  sx={{ border: "1px solid #C7DFF7", marginBottom: "10px" }}
                  indicator={<AddIcon />}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {key.title}
                    <ArrowUpwardIcon
                     className="hover:bg-blue-600 bg-blue-400"
                      onClick={(e) => reorderParent(parentIndex, "up",e)}
                       sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}

                    />
                    <ArrowDownwardIcon
                    className="hover:bg-blue-600 bg-blue-400"
                      onClick={(e) => reorderParent(parentIndex, "down",e)}
                       sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}

                    />
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  {key.items.map((element, childIndex) => (
                    <Accordion key={childIndex} className="relative z-[10]">
                      <AccordionSummary
                        sx={{
                          border: "1px solid #C7DFF7",
                          marginBottom: "10px",
                          position: "relative",
                        }}
                        indicator={<AddIcon />}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {element.heading}
                          <ArrowUpwardIcon
                          className="hover:bg-blue-600 bg-blue-400"
                            onClick={(e) =>
                              reorderChild(parentIndex, childIndex, "up",e)
                            }
                            sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}
                          />
                          <ArrowDownwardIcon
                          className="hover:bg-blue-600 bg-blue-400"
                            onClick={(e) =>
                              reorderChild(parentIndex, childIndex, "down",e)
                            }
                             sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}

                          />
                        </div>
                      </AccordionSummary>
                      {element?.details?.map((data, detailIndex) => (
                        <AccordionDetails
                          key={detailIndex}
                          className={`cursor-pointer ${
                            mode === "dark"
                              ? "hover:bg-slate-700"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {data.title}
                            <ArrowUpwardIcon
                            className="hover:bg-blue-600 bg-blue-400"
                              onClick={(e) =>
                                reorderDetails(parentIndex, childIndex, detailIndex, "up",e)
                              }
                               sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}

                            />
                            <ArrowDownwardIcon
                            className="hover:bg-blue-600 bg-blue-400 text-white"
                              onClick={(e) =>
                                reorderDetails(parentIndex, childIndex, detailIndex, "down",e)
                              }
                               sx={{ cursor: "pointer", marginLeft: "10px",color:"white",fontWeight:"bold",borderRadius:"50%", padding:"2px 3px", fontSize:"25px" }}

                            />
                          </div>
                        </AccordionDetails>
                      ))}
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <p>Loading or No Data Available...</p>
          )}
        </AccordionGroup>
      </div>
    </div>
  );
};

export default ReorderListInvestorData;
