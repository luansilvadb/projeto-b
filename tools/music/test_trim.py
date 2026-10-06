import numpy as np

from trim import body_start, trim

SAMPLE_RATE = 1000


def tone(seconds: float, amplitude: float) -> np.ndarray:
    time = np.arange(int(seconds * SAMPLE_RATE)) / SAMPLE_RATE
    return (amplitude * np.sin(2 * np.pi * 50 * time)).astype(np.float32)


BODY = [-15.0] * 40


def test_body_start_acha_a_janela_em_que_a_faixa_chega_ao_corpo():
    levels = np.array([-40.0, -30.0, -25.0] + BODY)
    assert body_start(levels, max_start=10) == 3


def test_body_start_ignora_a_nota_solta_da_introducao():
    # Uma janela alta no meio da introdução, e a música volta a quase nada.
    levels = np.array([-40.0, -15.0, -38.0, -36.0, -35.0, -34.0] + BODY)
    assert body_start(levels, max_start=10) > 2


def test_body_start_nao_passa_da_sobra_que_a_faixa_tem():
    levels = np.array([-40.0] * 6 + BODY)
    assert body_start(levels, max_start=1) == 1


def test_trim_pula_a_entrada_lenta_e_devolve_o_tamanho_pedido():
    audio = np.concatenate([tone(4, 0.001), tone(20, 0.5), tone(3, 0.001)])
    cut = trim(audio, SAMPLE_RATE, 15)
    assert len(cut) == 15 * SAMPLE_RATE
    # O corte começa no corpo: o meio segundo seguinte à rampa já está cheio.
    assert np.abs(cut[100:600]).max() > 0.4
    # E termina antes do fim que morre.
    assert np.abs(cut[-600:-100]).max() > 0.4


def test_trim_devolve_inteira_a_faixa_sem_sobra():
    audio = tone(10, 0.5)
    assert trim(audio, SAMPLE_RATE, 12) is audio


def test_trim_mantem_os_dois_canais():
    stereo = np.stack([tone(20, 0.5), tone(20, 0.5)], axis=1)
    assert trim(stereo, SAMPLE_RATE, 10).shape == (10 * SAMPLE_RATE, 2)
