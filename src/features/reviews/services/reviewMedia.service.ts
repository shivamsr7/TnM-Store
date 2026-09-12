import { supabase } from "@/shared/lib/supabase";

import type {
  ReviewMedia,
  ReviewMediaType,
} from "../types/reviewMedia.types";


export interface CreateReviewMediaInput {
  review_id: string;
  media_type: ReviewMediaType;
  media_url: string;
  storage_path: string | null;
  thumbnail_url: string | null;
  sort_order: number;
}


class ReviewMediaService {

  /*
   * =========================================================
   * GET MEDIA FOR ONE REVIEW
   * =========================================================
   */

  async getByReviewId(
    reviewId: string
  ): Promise<ReviewMedia[]> {

    const {
      data,
      error,
    } = await supabase
      .from("review_media")
      .select(`
        id,
        review_id,
        media_type,
        media_url,
        storage_path,
        thumbnail_url,
        sort_order,
        created_at
      `)
      .eq(
        "review_id",
        reviewId
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


    if (error) {
      throw error;
    }


    return (
      data ?? []
    ) as ReviewMedia[];
  }


  /*
   * =========================================================
   * GET MEDIA FOR MULTIPLE REVIEWS
   * =========================================================
   *
   * Used by the public product reviews section.
   *
   * Fetches media for all approved reviews in ONE query.
   *
   * =========================================================
   */

  async getByReviewIds(
    reviewIds: string[]
  ): Promise<ReviewMedia[]> {

    if (
      reviewIds.length === 0
    ) {
      return [];
    }


    const {
      data,
      error,
    } = await supabase
      .from("review_media")
      .select(`
        id,
        review_id,
        media_type,
        media_url,
        storage_path,
        thumbnail_url,
        sort_order,
        created_at
      `)
      .in(
        "review_id",
        reviewIds
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


    if (error) {
      throw error;
    }


    return (
      data ?? []
    ) as ReviewMedia[];
  }


  /*
   * =========================================================
   * CREATE MEDIA
   * =========================================================
   *
   * Uses the secure customer RPC.
   *
   * DO NOT CHANGE THE EXISTING UPLOAD LOGIC.
   *
   * =========================================================
   */

  async createMany(
    media: CreateReviewMediaInput[]
  ): Promise<ReviewMedia[]> {

    if (
      media.length === 0
    ) {
      return [];
    }


    const createdMedia:
      ReviewMedia[] = [];


    for (
      const item of media
    ) {

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_customer_review_media",
        {
          p_review_id:
            item.review_id,

          p_media_type:
            item.media_type,

          p_media_url:
            item.media_url,

          p_storage_path:
            item.storage_path,

          p_thumbnail_url:
            item.thumbnail_url,

          p_sort_order:
            item.sort_order,
        }
      );


      if (error) {
        throw error;
      }


      if (!data) {
        throw new Error(
          "Review media could not be created."
        );
      }


      createdMedia.push(
        data as ReviewMedia
      );

    }


    return createdMedia;
  }


  /*
   * =========================================================
   * DELETE REVIEW MEDIA METADATA
   * =========================================================
   */

  async deleteByReviewId(
    reviewId: string
  ): Promise<void> {

    const {
      error,
    } = await supabase
      .from("review_media")
      .delete()
      .eq(
        "review_id",
        reviewId
      );


    if (error) {
      throw error;
    }
  }

}


export const reviewMediaService =
  new ReviewMediaService();