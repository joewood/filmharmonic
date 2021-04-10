import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@chakra-ui/react";
import * as React from "react";

export const ServerError: React.FC<{ message: string }> = ({ message }) => (
  <Alert status="error">
    <AlertIcon />
    <AlertTitle mr={2}>Server Error</AlertTitle>
    <AlertDescription>{message}.</AlertDescription>
  </Alert>
);
