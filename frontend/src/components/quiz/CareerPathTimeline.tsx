"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CareerPath, CareerPathStep } from "@/types/careerPath";
import { Clock, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface CareerPathTimelineProps {
  careerPath: CareerPath;
}

export const CareerPathTimeline = ({ careerPath }: CareerPathTimelineProps) => {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = Number.parseInt(
              entry.target.getAttribute("data-step") || "0"
            );
            setVisibleSteps((prev) => new Set([...prev, stepIndex]));
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll("[data-step]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* Full-bleed background stripe */}
      <div className="absolute left-1/2 -translate-x-1/2 w-screen inset-y-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-emerald-50/20" />
      <div className="w-full min-h-screen">
        {/* Header Section */}
        <div className="w-full py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 mb-6 px-4  rounded-full bg-blue-100 border border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-sm font-semibold text-blue-600">
                  Lộ trình sự nghiệp
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl min-h-20 font-bold  text-balance bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {careerPath.title}
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground my-8 max-w-3xl mx-auto leading-relaxed text-balance">
                {careerPath.description}
              </p>

              {/* Duration Badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-blue-200 w-fit mx-auto mb-12">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-foreground">
                  Thời gian ước tính:{" "}
                  <span className="text-blue-600 font-semibold">
                    {careerPath.estimate_duration}
                  </span>
                </span>
              </div>

              {/* Resources Card */}
              {careerPath.resources && (
                <Card className="max-w-2xl mx-auto border-2 border-blue-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-600">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      Tài nguyên tổng quan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {careerPath.resources.split(",").map((resource, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 text-left"
                        >
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
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
          </div>
        </div>

        {/* Timeline Section */}
        <div className="w-full py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Animated Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 hidden lg:block">
                <div className="h-full w-full bg-gradient-to-b from-blue-600 via-emerald-500 to-blue-400 rounded-full shadow-lg" />
              </div>

              {/* Steps */}
              <div className="space-y-16 sm:space-y-20">
                {careerPath.careerPathSteps.map(
                  (step: CareerPathStep, index: number) => {
                    const isLeft = index % 2 === 0;
                    const isVisible = visibleSteps.has(index);

                    return (
                      <div
                        key={step.id}
                        data-step={index}
                        className={`relative transition-all duration-700 ${
                          isVisible ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {/* Step Dot with Glow */}
                        <div className="absolute left-1/2 top-8 -translate-x-1/2 z-20 hidden lg:block">
                          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold text-lg border-4 border-white shadow-xl">
                            {index + 1}
                          </div>
                        </div>

                        {/* Mobile step number */}
                        <div className="flex items-center gap-3 mb-4 lg:hidden">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {index + 1}
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                            {step.title}
                          </h3>
                        </div>

                        {/* Content Grid */}
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
                          <div className={`${isLeft ? "" : "lg:col-start-2"}`}>
                            <Card className="h-full shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 bg-white hover:border-red-300 hover:bg-red-50/30 group">
                              <CardHeader className="relative">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <CardTitle className="hidden lg:block text-2xl sm:text-3xl text-foreground mb-2">
                                      {step.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                      Bước {index + 1}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-6 h-6 text-blue-600/40 group-hover:text-red-400 transition-colors hidden lg:block" />
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-6">
                                <p className="text-base text-muted-foreground leading-relaxed">
                                  {step.description}
                                </p>

                                {step.resources && (
                                  <div className="pt-6 border-t border-blue-100">
                                    <p className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4" />
                                      Tài nguyên học tập
                                    </p>
                                    <ul className="space-y-3">
                                      {step.resources
                                        .split(",")
                                        .map(
                                          (resource: string, idx: number) => (
                                            <li
                                              key={idx}
                                              className="flex items-start gap-3 group/item"
                                            >
                                              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                                              <span className="text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                                                {resource.trim()}
                                              </span>
                                            </li>
                                          )
                                        )}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        <div className="w-full bg-gradient-to-r from-blue-50 to-emerald-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex flex-col items-center gap-4 px-8 py-8 rounded-2xl bg-white border-2 border-emerald-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Bạn đã sẵn sàng!
                </h3>
                <p className="text-muted-foreground">
                  Hãy bắt đầu hành trình phát triển sự nghiệp của bạn ngay hôm
                  nay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
