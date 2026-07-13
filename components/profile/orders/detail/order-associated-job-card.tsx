import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateInTimezone } from "@/lib/date.utils";
import type { OrderJobInfo } from "@/store/orders.store";
import {
  IconBriefcase,
  IconCalendar,
  IconMapPin,
  IconReceipt2,
} from "@tabler/icons-react";
import { InfoRow } from "./order-info-row";
import { SectionLabel } from "./order-section-label";

interface OrderAssociatedJobCardProps {
  job: OrderJobInfo;
}

export function OrderAssociatedJobCard({ job }: OrderAssociatedJobCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <IconBriefcase className="size-4 text-primary" />
            </div>
            Associated Job
          </CardTitle>
          <Button asChild>
            <a
              href={`/jobs/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Job
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SectionLabel>Title</SectionLabel>
          <p className="text-sm font-medium mt-1">{job.title}</p>
        </div>

        {job.description && (
          <div>
            <SectionLabel>Description</SectionLabel>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
              {job.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow
            icon={IconBriefcase}
            label="Type"
            value={
              job.type ? (
                <Badge variant="secondary" className="text-xs font-medium">
                  {job.type}
                </Badge>
              ) : (
                "N/A"
              )
            }
          />
          <InfoRow
            icon={IconReceipt2}
            label="Budget"
            value={job.budget ?? "N/A"}
          />
          {job.location && (
            <InfoRow icon={IconMapPin} label="Location" value={job.location} />
          )}
          {job.deadline && (
            <InfoRow
              icon={IconCalendar}
              label="Deadline"
              value={formatDateInTimezone(job.deadline)}
            />
          )}
        </div>

        {job.required_skills && job.required_skills.length > 0 && (
          <div>
            <SectionLabel>Required Skills</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {job.required_skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {job.tags && job.tags.length > 0 && (
          <div>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {job.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
