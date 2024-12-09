import React, { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useColorScheme } from "@mui/joy/styles";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/joy/AccordionSummary";
import Button from "@mui/joy/Button";
import AddIcon from "@mui/icons-material/Add";
import AlertInvertedColors from "../components/ui/Alerts";
const InvestorsRelation = () => {
  const { mode } = useColorScheme();

  const [investorData, setInvestorData] = useState({});
  const [activeTab, setActiveTab] = useState("announcements");
  const [activeFDMain, setActiveFDMain] = useState();

  const [alertMessage, setAlertMessage] = useState("");

  const tempArr = [
    "Announcements",
    "Stock Information",
    "Corporate Governance",
    "Financial Reporting",
  ];

  //this is fetching all the required data every time component render

  useEffect(() => {
    const fetchInvestorData = async () => {
      const token = localStorage.getItem("authToken");
      console.log("fetching result---------");
      try {
        let res = await fetch(
          `/admin-panel/Investor-relation?timestamp=${new Date().getTime()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Include token
              "Content-Type": "application/json",
            },
          }
        );
        let data = await res.json();
        console.log(data, "fetched data is ----------");
        setInvestorData(data);
        console.log("here is ", data[activeTab][0]);
      } catch (error) {
        console.error("Error fetching investor data:", error);
      }
    };
    fetchInvestorData();
  }, [activeTab]);



  return (
    <div>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {/* <Alert severity="success">{alertMessage || "Success"}</Alert> */}
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
            investorData[activeTab].map((key, id) => (
              <Accordion key={id}>
                <AccordionSummary
                  sx={{ border: "1px solid #C7DFF7", marginBottom: "10px" }}
                  indicator={<AddIcon />}
                  onClick={() => {
                    setActiveFDMain(key.title);
                    console.log("here is fd", key.title);
                  }}
                >
                  {key.title}
                  <div className="absolute z-[10] w-[286px] right-[20px]  flex justify-evenly"></div>
                </AccordionSummary>
                <AccordionDetails>
                  {key.items.map((element, id) => (
                    <Accordion key={id} className="relative z-[10]">
                      <AccordionSummary
                        sx={{
                          border: "1px solid #C7DFF7",
                          marginBottom: "10px",
                          position: "relative",
                        }}
                        indicator={<AddIcon />}
                        children={<CloudUploadIcon />}
                      >
                        {element.heading}
                      </AccordionSummary>
                      {element?.details?.map((data, id) => (
                        <AccordionDetails
                          className={`cursor-pointer ${
                            mode === "dark"
                              ? "hover:bg-slate-700"
                              : "hover:bg-slate-50"
                          }`}
                          key={id}
                        >
                          {data.title}
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

export default InvestorsRelation;
