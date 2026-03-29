import * as React from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface SectionCardProps {
  title: string
  description?: string
  value?: string | number
  trend?: "up" | "down"
  trendValue?: string
  footerTitle?: string
  footerDescription?: string
  className?: string
}

export function SectionCard({
  title,
  description,
  value,
  trend,
  trendValue,
  footerTitle,
  footerDescription,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        {value !== undefined ? (
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        ) : description ? (
          <CardTitle className="text-sm font-medium text-muted-foreground mt-1">
            {description}
          </CardTitle>
        ) : null}
        
        {(trend || trendValue) && (
          <CardAction>
            <Badge variant="outline">
              {trend === "up" ? (
                <IconTrendingUp data-icon="inline-start" className="size-4" />
              ) : trend === "down" ? (
                <IconTrendingDown data-icon="inline-start" className="size-4" />
              ) : null}
              {trendValue}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      
      {(footerTitle || footerDescription) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm border-t-0 bg-transparent">
          {footerTitle && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {footerTitle}
              {trend === "up" ? (
                <IconTrendingUp className="size-4" />
              ) : trend === "down" ? (
                <IconTrendingDown className="size-4" />
              ) : null}
            </div>
          )}
          {footerDescription && (
            <div className="text-muted-foreground">{footerDescription}</div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
