-- ----------------------------------------------------------------------------
-- L'audio « Notre histoire » devient la musique d'ambiance de la page :
-- le fichier public/audio/notre-histoire.mp3 a été renommé ambiance.mp3.
-- ----------------------------------------------------------------------------

update public.events
  set story_audio_url = '/audio/ambiance.mp3'
  where story_audio_url = '/audio/notre-histoire.mp3';
