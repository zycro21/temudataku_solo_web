import { PrismaClient, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

export const getJobs = async ({
  page,
  limit,
  jobTitle,
  country,
  level,
  workType,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  jobTitle?: string;
  country?: string;
  level?: string;
  workType?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const skip = (page - 1) * limit;

  const where: Prisma.JobWhereInput = {
    isActive: true,

    ...(jobTitle && {
      jobTitle: {
        contains: jobTitle,
        mode: "insensitive",
      },
    }),

    ...(country && {
      country: {
        equals: country,
        mode: "insensitive",
      },
    }),

    ...(level && {
      level: {
        equals: level,
        mode: "insensitive",
      },
    }),

    ...(workType && {
      workType,
    }),
  };

  const [totalJobs, jobs, totalCompanies, countries, salaryAggregation] =
    await Promise.all([
      prisma.job.count({
        where,
      }),

      prisma.job.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          company: {
            select: {
              companyName: true,
            },
          },
        },
      }),

      prisma.company.count(),

      prisma.job.findMany({
        distinct: ["country"],
        select: {
          country: true,
        },
      }),

      prisma.job.aggregate({
        where,
        _avg: {
          salaryMin: true,
          salaryMax: true,
        },
      }),
    ]);

  const averageSalaryMin = salaryAggregation._avg.salaryMin ?? 0;

  const averageSalaryMax = salaryAggregation._avg.salaryMax ?? 0;

  const averageSalary = Math.round((averageSalaryMin + averageSalaryMax) / 2);

  return {
    summary: {
      totalJobs,

      totalCompanies,

      totalCountries: countries.length,

      averageSalaryMin,

      averageSalaryMax,

      averageSalary,
    },

    meta: {
      total: totalJobs,
      page,
      limit,
      totalPages: Math.ceil(totalJobs / limit),
    },

    data: jobs.map((job) => ({
      id: job.id,

      companyName: job.company.companyName,

      jobTitle: job.jobTitle,

      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,

      city: job.city,
      country: job.country,

      workType: job.workType,

      level: job.level,

      experienceRequired: job.experienceRequired,
    })),
  };
};
