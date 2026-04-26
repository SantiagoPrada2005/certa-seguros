"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityIcon } from "lucide-react";
import { relativeTime } from "@/lib/format";

type ActivityItem = {
  id: string;
  action: string;
  type: string;
  createdAt: string;
  client: { name: string; type: string } | null;
};

const badgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  SUCCESS: "default",
  INFO: "secondary",
  WARNING: "outline",
  ERROR: "destructive",
};

const badgeIcon: Record<string, string> = {
  SUCCESS: "✓",
  INFO: "→",
  WARNING: "!",
  ERROR: "✕",
};

export function ActivityFeed({ feed }: { feed: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ActivityIcon className="size-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimas acciones registradas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {feed.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividad registrada aún.
            </p>
          )}
          {feed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="mt-0.5">
                <Badge
                  variant={badgeVariant[item.type] ?? "secondary"}
                  className="text-[10px] px-1.5 leading-none"
                >
                  {badgeIcon[item.type] ?? "·"}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium">{item.action}</span>
                {item.client && (
                  <span className="text-xs text-muted-foreground">
                    {item.client.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {relativeTime(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Actualizado automáticamente</span>
        </div>
      </CardFooter>
    </Card>
  );
}
