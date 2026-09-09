import {
  useMutation,
} from "@tanstack/react-query";

import {
  collaboratorService,
} from "../services/collaborator.service";

import type {
  CollaboratorApplicationData,
} from "../types/collaborator.types";

export function useCollaboratorApplication() {

  return useMutation({

    mutationFn: (
      data: CollaboratorApplicationData
    ) =>
      collaboratorService.submitApplication(
        data
      ),

  });

}