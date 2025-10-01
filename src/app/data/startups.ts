"use server";

import type { ActionResponse } from "@/app/data/types/action-response";
import { appErrors } from "@/app/data/types/errors";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { StartupStatus, StartupStage, MilestoneType } from "@prisma/client";

// Interfaces
export interface StartupWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  tag: string | null;
  website: string | null;
  logo: string | null;
  status: StartupStatus;
  stage: StartupStage;
  foundedAt: Date | null;
  revenue: number | null;
  employees: number | null;
  funding: number | null;
  valuation: number | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  githubRepo: string | null;
  industry: string | null;
  techStack: string[];
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatar: string | null;
    verified: boolean;
  };
  _count: {
    milestones: number;
  };
}

export interface StartupMilestone {
  id: string;
  title: string;
  description: string | null;
  type: MilestoneType;
  value: number | null;
  unit: string | null;
  achievedAt: Date;
  isPublic: boolean;
}

// Validation schemas
const createStartupSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().max(1000).optional(),
  tagline: z.string().max(150).optional(),
  tag: z.string().max(50).optional(),
  website: z.string().url().optional(),
  status: z.nativeEnum(StartupStatus).default(StartupStatus.IDEA),
  stage: z.nativeEnum(StartupStage).default(StartupStage.PRE_SEED),
  foundedAt: z.date().optional(),
  revenue: z.number().min(0).optional(),
  employees: z.number().min(1).optional(),
  funding: z.number().min(0).optional(),
  valuation: z.number().min(0).optional(),
  twitterHandle: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional(),
  githubRepo: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  techStack: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().default(true),
});

const updateStartupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
  description: z.string().max(1000).optional(),
  tagline: z.string().max(150).optional(),
  tag: z.string().max(50).optional(),
  website: z.string().url().optional(),
  status: z.nativeEnum(StartupStatus).optional(),
  stage: z.nativeEnum(StartupStage).optional(),
  foundedAt: z.date().optional(),
  revenue: z.number().min(0).optional(),
  employees: z.number().min(1).optional(),
  funding: z.number().min(0).optional(),
  valuation: z.number().min(0).optional(),
  twitterHandle: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional(),
  githubRepo: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  techStack: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
});

const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.nativeEnum(MilestoneType),
  value: z.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  achievedAt: z.date().default(() => new Date()),
  isPublic: z.boolean().default(true),
});

export type CreateStartupInput = z.infer<typeof createStartupSchema>;
export type UpdateStartupInput = z.infer<typeof updateStartupSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

/**
 * Create a new startup
 */
export async function createStartup(
  input: CreateStartupInput
): Promise<ActionResponse<StartupWithDetails>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = createStartupSchema.parse(input);

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        verified: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Create startup
    const startup = await prisma.startup.create({
      data: {
        ...validatedData,
        userId: authUser.id,
        techStack: validatedData.techStack || [],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidateTag(`user-startups-${authUser.id}`);

    const startupWithDetails: StartupWithDetails = {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      tagline: startup.tagline,
      tag: startup.tag,
      website: startup.website,
      logo: startup.logo,
      status: startup.status,
      stage: startup.stage,
      foundedAt: startup.foundedAt,
      revenue: startup.revenue ? Number(startup.revenue) : null,
      employees: startup.employees,
      funding: startup.funding ? Number(startup.funding) : null,
      valuation: startup.valuation ? Number(startup.valuation) : null,
      twitterHandle: startup.twitterHandle,
      linkedinUrl: startup.linkedinUrl,
      githubRepo: startup.githubRepo,
      industry: startup.industry,
      techStack: startup.techStack,
      isPublic: startup.isPublic,
      isFeatured: startup.isFeatured,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
      user: startup.user,
      _count: startup._count,
    };

    return {
      success: true,
      data: startupWithDetails,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error creating startup:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get startups by user ID
 */
export async function getStartupsByUser(
  userId: string
): Promise<ActionResponse<StartupWithDetails[]>> {
  try {
    const startups = await prisma.startup.findMany({
      where: {
        userId,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const startupsWithDetails: StartupWithDetails[] = startups.map(
      (startup) => ({
        id: startup.id,
        name: startup.name,
        slug: startup.slug,
        description: startup.description,
        tagline: startup.tagline,
        tag: startup.tag,
        website: startup.website,
        logo: startup.logo,
        status: startup.status,
        stage: startup.stage,
        foundedAt: startup.foundedAt,
        revenue: startup.revenue ? Number(startup.revenue) : null,
        employees: startup.employees,
        funding: startup.funding ? Number(startup.funding) : null,
        valuation: startup.valuation ? Number(startup.valuation) : null,
        twitterHandle: startup.twitterHandle,
        linkedinUrl: startup.linkedinUrl,
        githubRepo: startup.githubRepo,
        industry: startup.industry,
        techStack: startup.techStack,
        isPublic: startup.isPublic,
        isFeatured: startup.isFeatured,
        createdAt: startup.createdAt,
        updatedAt: startup.updatedAt,
        user: startup.user,
        _count: startup._count,
      })
    );

    return {
      success: true,
      data: startupsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching startups by user:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get user's own startups (including private ones)
 */
export async function getMyStartups(): Promise<
  ActionResponse<StartupWithDetails[]>
> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    const startups = await prisma.startup.findMany({
      where: {
        userId: authUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const startupsWithDetails: StartupWithDetails[] = startups.map(
      (startup) => ({
        id: startup.id,
        name: startup.name,
        slug: startup.slug,
        description: startup.description,
        tagline: startup.tagline,
        tag: startup.tag,
        website: startup.website,
        logo: startup.logo,
        status: startup.status,
        stage: startup.stage,
        foundedAt: startup.foundedAt,
        revenue: startup.revenue ? Number(startup.revenue) : null,
        employees: startup.employees,
        funding: startup.funding ? Number(startup.funding) : null,
        valuation: startup.valuation ? Number(startup.valuation) : null,
        twitterHandle: startup.twitterHandle,
        linkedinUrl: startup.linkedinUrl,
        githubRepo: startup.githubRepo,
        industry: startup.industry,
        techStack: startup.techStack,
        isPublic: startup.isPublic,
        isFeatured: startup.isFeatured,
        createdAt: startup.createdAt,
        updatedAt: startup.updatedAt,
        user: startup.user,
        _count: startup._count,
      })
    );

    return {
      success: true,
      data: startupsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching my startups:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get a single startup by slug
 */
export async function getStartupBySlug(
  slug: string
): Promise<ActionResponse<StartupWithDetails>> {
  try {
    const startup = await prisma.startup.findUnique({
      where: { slug: slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
    });

    if (!startup) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Check if startup is public or user owns it
    let canAccess = startup.isPublic;
    try {
      const { user: authUser } = await withAuth();
      if (authUser && startup.userId === authUser.id) {
        canAccess = true;
      }
    } catch {
      // Not authenticated
    }

    if (!canAccess) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    const startupWithDetails: StartupWithDetails = {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      tagline: startup.tagline,
      tag: startup.tag,
      website: startup.website,
      logo: startup.logo,
      status: startup.status,
      stage: startup.stage,
      foundedAt: startup.foundedAt,
      revenue: startup.revenue ? Number(startup.revenue) : null,
      employees: startup.employees,
      funding: startup.funding ? Number(startup.funding) : null,
      valuation: startup.valuation ? Number(startup.valuation) : null,
      twitterHandle: startup.twitterHandle,
      linkedinUrl: startup.linkedinUrl,
      githubRepo: startup.githubRepo,
      industry: startup.industry,
      techStack: startup.techStack,
      isPublic: startup.isPublic,
      isFeatured: startup.isFeatured,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
      user: startup.user,
      _count: startup._count,
    };

    return {
      success: true,
      data: startupWithDetails,
    };
  } catch (error) {
    console.error("Error fetching startup by slug:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}

/**
 * Get a single startup by ID
 */
export async function getStartup(
  startupId: string
): Promise<ActionResponse<StartupWithDetails>> {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
    });

    if (!startup) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Check if startup is public or user owns it
    let canAccess = startup.isPublic;
    try {
      const { user: authUser } = await withAuth();
      if (authUser && startup.userId === authUser.id) {
        canAccess = true;
      }
    } catch {
      // Not authenticated
    }

    if (!canAccess) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    const startupWithDetails: StartupWithDetails = {
      id: startup.id,
      name: startup.name,
      slug: startup.slug,
      description: startup.description,
      tagline: startup.tagline,
      tag: startup.tag,
      website: startup.website,
      logo: startup.logo,
      status: startup.status,
      stage: startup.stage,
      foundedAt: startup.foundedAt,
      revenue: startup.revenue ? Number(startup.revenue) : null,
      employees: startup.employees,
      funding: startup.funding ? Number(startup.funding) : null,
      valuation: startup.valuation ? Number(startup.valuation) : null,
      twitterHandle: startup.twitterHandle,
      linkedinUrl: startup.linkedinUrl,
      githubRepo: startup.githubRepo,
      industry: startup.industry,
      techStack: startup.techStack,
      isPublic: startup.isPublic,
      isFeatured: startup.isFeatured,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
      user: startup.user,
      _count: startup._count,
    };

    return {
      success: true,
      data: startupWithDetails,
    };
  } catch (error) {
    console.error("Error fetching startup:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Update a startup (only by owner)
 */
export async function updateStartup(
  startupId: string,
  input: UpdateStartupInput
): Promise<ActionResponse<StartupWithDetails>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = updateStartupSchema.parse(input);

    // Check if user owns the startup
    const existingStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!existingStartup) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (existingStartup.userId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Update startup
    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidateTag(`startup-${startupId}`);
    revalidateTag(`user-startups-${authUser.id}`);

    const startupWithDetails: StartupWithDetails = {
      id: updatedStartup.id,
      name: updatedStartup.name,
      slug: updatedStartup.slug,
      description: updatedStartup.description,
      tagline: updatedStartup.tagline,
      tag: updatedStartup.tag,
      website: updatedStartup.website,
      logo: updatedStartup.logo,
      status: updatedStartup.status,
      stage: updatedStartup.stage,
      foundedAt: updatedStartup.foundedAt,
      revenue: updatedStartup.revenue ? Number(updatedStartup.revenue) : null,
      employees: updatedStartup.employees,
      funding: updatedStartup.funding ? Number(updatedStartup.funding) : null,
      valuation: updatedStartup.valuation
        ? Number(updatedStartup.valuation)
        : null,
      twitterHandle: updatedStartup.twitterHandle,
      linkedinUrl: updatedStartup.linkedinUrl,
      githubRepo: updatedStartup.githubRepo,
      industry: updatedStartup.industry,
      techStack: updatedStartup.techStack,
      isPublic: updatedStartup.isPublic,
      isFeatured: updatedStartup.isFeatured,
      createdAt: updatedStartup.createdAt,
      updatedAt: updatedStartup.updatedAt,
      user: updatedStartup.user,
      _count: updatedStartup._count,
    };

    return {
      success: true,
      data: startupWithDetails,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error updating startup:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Delete a startup (only by owner)
 */
export async function deleteStartup(
  startupId: string
): Promise<ActionResponse<void>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Check if user owns the startup
    const existingStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!existingStartup) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (existingStartup.userId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Delete startup (cascade will handle milestones)
    await prisma.startup.delete({
      where: { id: startupId },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidateTag(`user-startups-${authUser.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting startup:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Add a milestone to a startup
 */
export async function addMilestone(
  startupId: string,
  input: CreateMilestoneInput
): Promise<ActionResponse<StartupMilestone>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = createMilestoneSchema.parse(input);

    // Check if user owns the startup
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { userId: true },
    });

    if (!startup) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (startup.userId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Create milestone
    const milestone = await prisma.startupMilestone.create({
      data: {
        ...validatedData,
        startupId,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidateTag(`startup-${startupId}`);

    return {
      success: true,
      data: {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        type: milestone.type,
        value: milestone.value ? Number(milestone.value) : null,
        unit: milestone.unit,
        achievedAt: milestone.achievedAt,
        isPublic: milestone.isPublic,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error adding milestone:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get milestones for a startup
 */
export async function getStartupMilestones(
  startupId: string
): Promise<ActionResponse<StartupMilestone[]>> {
  try {
    const milestones = await prisma.startupMilestone.findMany({
      where: {
        startupId,
        isPublic: true,
      },
      orderBy: {
        achievedAt: "desc",
      },
    });

    const milestonesData: StartupMilestone[] = milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      type: milestone.type,
      value: milestone.value ? Number(milestone.value) : null,
      unit: milestone.unit,
      achievedAt: milestone.achievedAt,
      isPublic: milestone.isPublic,
    }));

    return {
      success: true,
      data: milestonesData,
    };
  } catch (error) {
    console.error("Error fetching startup milestones:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Delete a milestone (only by startup owner)
 */
export async function deleteMilestone(
  milestoneId: string
): Promise<ActionResponse<void>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Check if user owns the startup that owns the milestone
    const milestone = await prisma.startupMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        startup: {
          select: { userId: true, id: true },
        },
      },
    });

    if (!milestone) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (milestone.startup.userId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Delete milestone
    await prisma.startupMilestone.delete({
      where: { id: milestoneId },
    });

    // Revalidate relevant paths
    revalidatePath("/profile");
    revalidateTag(`startup-${milestone.startup.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Cursor rules applied correctly.
