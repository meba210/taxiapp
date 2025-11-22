import BottomSheet from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  station: {
    id: number;
    name: string;
    taxis: number;
    passengers: number;
    routes?: string[]; // optional routes from start → station → destination
  } | null;
  onSelectRide?: (type: "normal" | "urgent") => void; // callback for ride selection
}

const StationBottomSheet = forwardRef<BottomSheet, Props>(({ station, onSelectRide }, ref) => {
  const snapPoints = ["25%", "50%"];

  if (!station) return null;

  return (
    <BottomSheet ref={ref} index={-1} snapPoints={snapPoints}>
      <View style={styles.sheetContent}>
        <Text style={styles.stationName}>{station.name}</Text>

        <View style={styles.infoRow}>
          <Text>Available Taxis: {station.taxis}</Text>
          <Text>Passengers in Queue: {station.passengers}</Text>
        </View>

        {station.routes && station.routes.length > 0 && (
          <View style={styles.routesContainer}>
            <Text style={styles.routesTitle}>Routes:</Text>
            {station.routes.map((route, index) => (
              <Text key={index} style={styles.routeText}>
                {index + 1}. {route}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.normalButton]}
            onPress={() => onSelectRide?.("normal")}
          >
            <Text style={styles.buttonText}>Normal Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.urgentButton]}
            onPress={() => onSelectRide?.("urgent")}
          >
            <Text style={styles.buttonText}>Urgent Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetContent: { flex: 1, padding: 20 },
  stationName: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  routesContainer: { marginBottom: 15 },
  routesTitle: { fontWeight: "bold", marginBottom: 5 },
  routeText: { fontSize: 14 },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5, alignItems: "center" },
  normalButton: { backgroundColor: "#1E3A8A" },
  urgentButton: { backgroundColor: "#D14343" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default StationBottomSheet;
