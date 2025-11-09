import { useState } from "react";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Building, Users, Bot } from "lucide-react";

interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  activeRobots: number;
  totalRobots: number;
  activeDeliveries: number;
}

interface BuildingSelectorProps {
  buildings: Building[];
  selectedBuilding: string;
  onBuildingChange: (buildingId: string) => void;
}

export function BuildingSelector({ buildings, selectedBuilding, onBuildingChange }: BuildingSelectorProps) {
  const currentBuilding = buildings.find(b => b.id === selectedBuilding);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building className="h-6 w-6 text-primary" />
        <h3>Building Management</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Select Building</label>
          <Select value={selectedBuilding} onValueChange={onBuildingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a building..." />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((building) => (
                <SelectItem key={building.id} value={building.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{building.name}</div>
                      <div className="text-xs text-muted-foreground">{building.address}</div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {building.activeDeliveries} active
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentBuilding && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Building className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">Floors</div>
              <div className="font-semibold">{currentBuilding.floors}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">Robots</div>
              <div className="font-semibold">
                {currentBuilding.activeRobots}/{currentBuilding.totalRobots}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">Deliveries</div>
              <div className="font-semibold">{currentBuilding.activeDeliveries}</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}