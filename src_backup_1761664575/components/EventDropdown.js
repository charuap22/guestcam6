import { useState } from "react";
import { FormControl, FormLabel, Select, Box, Text } from "@chakra-ui/react";

const eventOptions = {
  Wedding: ["Reception", "Engagement", "Bridal Shower"],
  Corporate: ["Conference", "Seminar", "Product Launch"],
  Birthday: ["Kids Party", "18th Birthday", "50th Celebration"],
};

const EventDropdown = () => {
  const [selectedEvent, setSelectedEvent] = useState("");

  return (
    <Box>
      {/* Single Dropdown for Event Type */}
      <FormControl id="eventType">
        <FormLabel>Event Type</FormLabel>
        <Select
          placeholder="Select Event Type"
          onChange={(e) => setSelectedEvent(e.target.value)}
          value={selectedEvent}
        >
          {Object.entries(eventOptions).map(([category, events]) => (
            <optgroup label={category} key={category}>
              {events.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </FormControl>

      {/* Display Selected Event */}
      {selectedEvent && (
        <Text mt={4} fontWeight="bold">
          Selected Event: {selectedEvent}
        </Text>
      )}
    </Box>
  );
};

export default EventDropdown;
