import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CareerPath } from "@/types/careerPath";
import { Clock, BookOpen, CheckCircle2 } from "lucide-react";

interface CareerPathTimelineProps {
  careerPath: CareerPath;
}

export const CareerPathTimeline = ({ careerPath }: CareerPathTimelineProps) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-6 mt-10 text-foreground">
          {careerPath.title}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {careerPath.description}
        </p>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-base font-medium">
            {careerPath.estimate_duration}
          </span>
        </div>
        {careerPath.resources && (
          <Card className="mt-8 max-w-3xl mx-auto border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-primary" />
                Tài nguyên tổng quan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-left">
                {careerPath.resources.split(",").map((resource, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {resource.trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 via-primary/20 to-primary/40 -translate-x-1/2 rounded-full" />

        {/* Steps */}
        <div className="space-y-12">
          {careerPath.careerPathSteps.map((step, index) => {
            const isLeft = index % 2 === 0;

            return (
              <div key={step.id} className="relative">
                {/* Step number dot */}
                <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base border-4 border-background shadow-lg">
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
                    <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
                      <CardHeader>
                        <CardTitle className="text-2xl text-foreground">
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                        {step.resources && (
                          <div className="pt-4 mt-4 border-t border-border">
                            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              Tài nguyên học tập
                            </p>
                            <ul className="space-y-2">
                              {step.resources
                                .split(",")
                                .map((resource, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">
                                      {resource.trim()}
                                    </span>
                                  </li>
                                ))}
                            </ul>
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
