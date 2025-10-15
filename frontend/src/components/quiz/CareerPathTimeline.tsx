import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import type { CareerPath } from "@/api";

interface CareerPathTimelineProps {
  careerPath: CareerPath;
}

export const CareerPathTimeline = ({ careerPath }: CareerPathTimelineProps) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          {careerPath.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
          {careerPath.description}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            {careerPath.level}
          </Badge>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{careerPath.estimate_duration}</span>
          </div>
        </div>
        {careerPath.resources && (
          <div className="mt-6 p-4 bg-muted rounded-lg max-w-3xl mx-auto">
            <div className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm text-foreground mb-1">
                  Tài nguyên tổng quan:
                </p>
                <p className="text-sm text-muted-foreground">
                  {careerPath.resources}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

        {/* Steps */}
        <div className="space-y-12">
          {careerPath.careerPathSteps.map((step, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div key={step.id} className="relative">
                {/* Step number dot */}
                <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm border-4 border-background">
                    {index + 1}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`grid grid-cols-2 gap-8 ${
                    isLeft ? "" : "grid-flow-dense"
                  }`}
                >
                  <div className={isLeft ? "" : "col-start-2"}>
                    <Card className="shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                        {step.resources && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground mb-2">
                              Tài nguyên học tập:
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {step.resources}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  <div className={isLeft ? "col-start-2" : ""} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
