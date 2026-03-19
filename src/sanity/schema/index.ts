import { productSchema } from "./product";
import { exhibitSchema } from "./exhibit";
import { journalSchema } from "./journal";
import shoppableImage from "./objects/shoppableImage";
import museumExhibit from "./objects/museumExhibit";
import { fieldReportSchema } from "./objects/fieldReport";

import { fieldJournalSchema } from "./fieldJournal";

import { territorySchema } from "./territory";

import { heroBackgroundsSchema } from "./heroBackgrounds";
import { placeholderImagesSchema } from "./placeholderImages";
import { portOfCallSchema } from "./portOfCall";
import { reviewSchema } from "./review";

export const schemaTypes = [productSchema, exhibitSchema, journalSchema, shoppableImage, museumExhibit, fieldReportSchema, fieldJournalSchema, territorySchema, heroBackgroundsSchema, placeholderImagesSchema, portOfCallSchema, reviewSchema];

